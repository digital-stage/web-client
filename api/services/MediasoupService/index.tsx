import {
    addMediasoupAudioConsumer,
    addMediasoupAudioProducer,
    addMediasoupVideoConsumer,
    addMediasoupVideoProducer,
    removeMediasoupAudioConsumer,
    removeMediasoupAudioProducer,
    removeMediasoupVideoProducer,
    useConnection,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { shallowEqual, useDispatch } from 'react-redux'
import { ITeckosClient, TeckosClient } from 'teckos-client'
import { Device, Device as MDevice } from 'mediasoup-client/lib/Device'
import {
    closeConsumer,
    createConsumer,
    createProducer,
    createWebRTCTransport,
    getRTPCapabilities,
    publishProducer,
    resumeConsumer,
    stopProducer,
} from './util'
import debug from 'debug'
import { useEffect, useMemo, useState } from 'react'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'
import {
    ClientDeviceEvents,
    MediasoupAudioTrack,
    MediasoupVideoTrack,
    Stage,
} from '@digitalstage/api-types'
import { Transport } from 'mediasoup-client/lib/Transport'
import getAudioTracks from '../utils/getAudioTracks'
import getVideoTracks from '../utils/getVideoTracks'

const info = debug('mediasoup')
const error = info.extend('error')

const MediasoupService = () => {
    const dispatch = useDispatch()
    const { emit } = useConnection()
    const localDevice = useStageSelector<BrowserDevice | undefined>(
        (state) =>
            state.globals.localDeviceId
                ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice)
                : undefined,
        shallowEqual
    )
    const stage = useStageSelector<Stage | undefined>(
        (state) => (state.stages.byId ? state.stages.byId[state.globals.stageId] : undefined),
        shallowEqual
    )
    const videoTracks = useStageSelector<MediasoupVideoTrack[]>((state) =>
        stage?.videoType === 'mediasoup' && state.videoTracks.byStage[stage._id]
            ? (state.videoTracks.byStage[stage._id]
                  .map((id) => state.videoTracks.byId[id])
                  .filter((track) => track.type === 'mediasoup') as MediasoupVideoTrack[])
            : []
    )
    const audioTracks = useStageSelector<MediasoupAudioTrack[]>((state) =>
        stage?.audioType === 'mediasoup' && state.audioTracks.byStage[stage._id]
            ? (state.audioTracks.byStage[stage._id]
                  .map((id) => state.audioTracks.byId[id])
                  .filter((track) => track.type === 'mediasoup') as MediasoupAudioTrack[])
            : []
    )
    const routerUrl = useMemo<string | undefined>(() => {
        if (
            stage &&
            (stage?.videoType === 'mediasoup' || stage?.audioType === 'mediasoup') &&
            stage.mediasoup
        ) {
            return `${stage.mediasoup.url}:${stage.mediasoup.port}`
        }
        return undefined
    }, [stage])

    const [device, setDevice] = useState<Device>()
    const [connection, setConnection] = useState<ITeckosClient>()
    const [sendTransport, setSendTransport] = useState<Transport>()
    const [receiveTransport, setReceiveTransport] = useState<Transport>()
    useEffect(() => {
        if (routerUrl) {
            let transports: Transport[] = []
            info(`Connecting to router ${routerUrl}`)
            const conn = new TeckosClient(routerUrl, {
                reconnection: true,
            })
            const disconnect = () => {
                transports.map((transport) => transport.close())
                conn.disconnect()
            }
            conn.on('disconnect', () => {
                info(`Disconnected from router`)
                disconnect()
            })
            conn.on('connect', async () => {
                info(`Connected to router ${routerUrl}`)
                try {
                    const device = new MDevice()
                    const rtpCapabilities = await getRTPCapabilities(conn)
                    await device.load({ routerRtpCapabilities: rtpCapabilities })
                    console.log('CONNECTING HERE')
                    transports = await Promise.all([
                        createWebRTCTransport(conn, device, 'send'),
                        createWebRTCTransport(conn, device, 'receive'),
                    ])
                    setConnection(conn)
                    setDevice(device)
                    setSendTransport(transports[0])
                    setReceiveTransport(transports[1])
                } catch (err) {
                    error(err)
                }
            })
            conn.connect()

            return () => {
                info(`Disconnecting from router`)
                disconnect()
                setDevice(undefined)
                setConnection(undefined)
                setSendTransport(undefined)
                setReceiveTransport(undefined)
            }
        }
    }, [routerUrl])

    const videoProducers = useStageSelector((state) => state.mediasoup.videoProducers)
    useEffect(() => {
        if (emit && connection && sendTransport && stage?._id) {
            if (localDevice?.sendVideo && !localDevice.useP2P) {
                getVideoTracks(localDevice.inputVideoDeviceId).then((tracks) =>
                    tracks.map(async (track) => {
                        const producer = await createProducer(sendTransport, track)
                        if (producer.paused) {
                            info(`Producer ${producer.id} is paused`)
                            producer.resume()
                        }
                        const localProducer = await publishProducer(emit, stage._id, producer)
                        info(`Published video ${producer.id}`)
                        dispatch(addMediasoupVideoProducer(localProducer._id, producer))
                    })
                )
            }
        }
    }, [
        emit,
        connection,
        dispatch,
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        sendTransport,
        stage?._id,
    ])
    useEffect(() => {
        if (connection && emit) {
            if (!localDevice?.sendVideo || localDevice?.useP2P) {
                videoProducers.allIds.map((id) => {
                    emit(ClientDeviceEvents.RemoveVideoTrack, id)
                    dispatch(removeMediasoupVideoProducer(id))
                    return stopProducer(connection, videoProducers.byId[id])
                })
            }
        }
    }, [
        emit,
        connection,
        dispatch,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        videoProducers.allIds,
        videoProducers.byId,
    ])

    const audioProducers = useStageSelector((state) => state.mediasoup.audioProducers)
    useEffect(() => {
        if (emit && connection && sendTransport && stage?._id) {
            if (localDevice?.sendAudio && !localDevice.useP2P) {
                getAudioTracks({
                    inputAudioDeviceId: localDevice.inputAudioDeviceId,
                    autoGainControl: localDevice.autoGainControl,
                    echoCancellation: localDevice.echoCancellation,
                    noiseSuppression: localDevice.noiseSuppression,
                    sampleRate: localDevice.sampleRate,
                }).then((tracks) =>
                    tracks.map(async (track) => {
                        const producer = await createProducer(sendTransport, track)
                        if (producer.paused) {
                            info(`Producer ${producer.id} is paused`)
                            producer.resume()
                        }
                        const localProducer = await publishProducer(emit, stage._id, producer)
                        info(`Published audio ${producer.id}`)
                        dispatch(addMediasoupAudioProducer(localProducer._id, producer))
                    })
                )
            }
        }
    }, [
        emit,
        connection,
        dispatch,
        localDevice?.autoGainControl,
        localDevice?.echoCancellation,
        localDevice?.inputAudioDeviceId,
        localDevice?.inputVideoDeviceId,
        localDevice?.noiseSuppression,
        localDevice?.sampleRate,
        localDevice?.sendAudio,
        localDevice?.useP2P,
        sendTransport,
        stage?._id,
    ])
    useEffect(() => {
        if (connection && emit) {
            if (!localDevice?.sendAudio || localDevice?.useP2P) {
                audioProducers.allIds.map((id) => {
                    emit(ClientDeviceEvents.RemoveAudioTrack, id)
                    dispatch(removeMediasoupAudioProducer(id))
                    return stopProducer(connection, audioProducers.byId[id])
                })
            }
        }
    }, [
        emit,
        audioProducers.allIds,
        audioProducers.byId,
        connection,
        dispatch,
        localDevice?.sendAudio,
        localDevice?.useP2P,
        videoProducers.allIds,
        videoProducers.byId,
    ])

    const videoConsumers = useStageSelector((state) => state.mediasoup.videoConsumers)
    useEffect(() => {
        if (connection && receiveTransport) {
            console.log('Sync video consumers')
            if (localDevice?.receiveVideo) {
                // Add missing consumers
                const addedTracks = videoTracks.filter(
                    (track) => !videoConsumers.byId[track._id] && track.deviceId !== localDevice._id
                )
                const removedTracks = videoConsumers.allIds.filter((id) =>
                    videoTracks.find((videoTrack) => videoTrack._id !== id)
                )
                Promise.all([
                    addedTracks.map(async (track) => {
                        const consumer = await createConsumer(
                            connection,
                            device,
                            receiveTransport,
                            track.producerId
                        )
                        if (consumer.paused) await resumeConsumer(connection, consumer)
                        dispatch(addMediasoupVideoConsumer(track._id, consumer))
                    }),
                    removedTracks.map(async (id) => {
                        dispatch(removeMediasoupAudioConsumer(id))
                        await closeConsumer(connection, videoConsumers.byId[id])
                    }),
                ]).catch((err) => console.error(err))
            }
        }
    }, [
        connection,
        device,
        dispatch,
        localDevice?._id,
        localDevice?.receiveVideo,
        receiveTransport,
        videoConsumers.allIds,
        videoConsumers.byId,
        videoTracks,
    ])
    useEffect(() => {
        if (connection) {
            if (!localDevice?.receiveVideo) {
                videoConsumers.allIds.map((id) => {
                    dispatch(removeMediasoupAudioConsumer(id))
                    return closeConsumer(connection, videoConsumers.byId[id])
                })
            }
        }
    }, [
        connection,
        device,
        dispatch,
        localDevice?.receiveVideo,
        receiveTransport,
        videoConsumers.allIds,
        videoConsumers.byId,
        videoTracks,
    ])

    const audioConsumers = useStageSelector((state) => state.mediasoup.audioConsumers)
    useEffect(() => {
        if (connection && receiveTransport) {
            console.log('Sync audio consumers')
            if (localDevice?.receiveAudio) {
                // Add missing consumers
                const addedTracks = audioTracks.filter(
                    (track) => !audioConsumers.byId[track._id] && track.deviceId !== localDevice._id
                )
                const removedTracks = audioConsumers.allIds.filter((id) =>
                    audioTracks.find((audioTrack) => audioTrack._id !== id)
                )
                Promise.all([
                    addedTracks.map(async (track) => {
                        const consumer = await createConsumer(
                            connection,
                            device,
                            receiveTransport,
                            track.producerId
                        )
                        if (consumer.paused) await resumeConsumer(connection, consumer)
                        dispatch(addMediasoupAudioConsumer(track._id, consumer))
                    }),
                    removedTracks.map(async (id) => {
                        dispatch(removeMediasoupAudioConsumer(id))
                        await closeConsumer(connection, audioConsumers.byId[id])
                    }),
                ]).catch((err) => console.error(err))
            }
        }
    }, [
        connection,
        device,
        dispatch,
        localDevice?._id,
        localDevice?.receiveAudio,
        receiveTransport,
        audioConsumers.allIds,
        audioConsumers.byId,
        audioTracks,
    ])
    useEffect(() => {
        if (connection) {
            if (!localDevice?.receiveAudio) {
                audioConsumers.allIds.map((id) => {
                    dispatch(removeMediasoupAudioConsumer(id))
                    return closeConsumer(connection, audioConsumers.byId[id])
                })
            }
        }
    }, [
        connection,
        device,
        dispatch,
        localDevice?.receiveAudio,
        receiveTransport,
        audioConsumers.allIds,
        audioConsumers.byId,
        audioTracks,
    ])

    return null
}
export default MediasoupService

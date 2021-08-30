import { useEmit, useErrorReporting, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import { ITeckosClient, TeckosClient } from 'teckos-client'
import { Device as MediasoupDevice } from 'mediasoup-client/lib/Device'
import {
    consume,
    createProducer,
    createWebRTCTransport,
    getRTPCapabilities,
    publishProducer,
    stopProducer,
    unpublishProducer,
} from './util'
import debug from 'debug'
import React from 'react'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'
import { MediasoupAudioTrack, MediasoupVideoTrack } from '@digitalstage/api-types'
import { Transport } from 'mediasoup-client/lib/Transport'
import { getVideoTracks } from '../../utils/getVideoTracks'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { getAudioTracks } from '../../utils/getAudioTracks'
import { omit } from 'lodash'

const report = debug('MediasoupService')

type ConnectionState = {
    routerConnection: ITeckosClient
    sendTransport: Transport
    receiveTransport: Transport
    device: MediasoupDevice
}

type ProducerList = { [trackId: string]: Producer }
type ConsumerList = { [trackId: string]: Consumer }
type DispatchProducerList = React.Dispatch<React.SetStateAction<ProducerList>>
type DispatchConsumerList = React.Dispatch<React.SetStateAction<ConsumerList>>

const VideoProducerContext = React.createContext<ProducerList>(undefined)
const DispatchVideoProducerContext = React.createContext<DispatchProducerList>(undefined)
const VideoConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchVideoConsumerContext = React.createContext<DispatchConsumerList>(undefined)
const AudioProducerContext = React.createContext<ProducerList>(undefined)
const DispatchAudioProducerContext = React.createContext<DispatchProducerList>(undefined)
const AudioConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchAudioConsumerContext = React.createContext<DispatchConsumerList>(undefined)
const MediasoupProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoProducers, setVideoProducers] = React.useState<ProducerList>({})
    const [videoConsumers, setVideoConsumers] = React.useState<ConsumerList>({})
    const [audioProducers, setAudioProducers] = React.useState<ProducerList>({})
    const [audioConsumers, setAudioConsumers] = React.useState<ConsumerList>({})

    return (
        <DispatchVideoProducerContext.Provider value={setVideoProducers}>
            <VideoProducerContext.Provider value={videoProducers}>
                <DispatchVideoConsumerContext.Provider value={setVideoConsumers}>
                    <VideoConsumerContext.Provider value={videoConsumers}>
                        <DispatchAudioProducerContext.Provider value={setAudioProducers}>
                            <AudioProducerContext.Provider value={audioProducers}>
                                <DispatchAudioConsumerContext.Provider value={setAudioConsumers}>
                                    <AudioConsumerContext.Provider value={audioConsumers}>
                                        {children}
                                    </AudioConsumerContext.Provider>
                                </DispatchAudioConsumerContext.Provider>
                            </AudioProducerContext.Provider>
                        </DispatchAudioProducerContext.Provider>
                    </VideoConsumerContext.Provider>
                </DispatchVideoConsumerContext.Provider>
            </VideoProducerContext.Provider>
        </DispatchVideoProducerContext.Provider>
    )
}
const useVideoProducers = (): ProducerList => {
    const state = React.useContext(VideoProducerContext)
    if (state === undefined)
        throw new Error('useVideoProducers must be used within a MediasoupProvider')
    return state
}
const useVideoConsumers = (): ConsumerList => {
    const state = React.useContext(VideoConsumerContext)
    if (state === undefined)
        throw new Error('useVideoConsumers must be used within a MediasoupProvider')
    return state
}

const MediasoupService = () => {
    report('RERENDER')
    const emit = useEmit()
    const reportError = useErrorReporting()
    const localStageDeviceId = useStageSelector<string>((state) => state.globals.localStageDeviceId)

    const {
        inputVideoDeviceId,
        sendVideo,
        sendAudio,
        useP2P,
        inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
    } = useStageSelector<{
        inputVideoDeviceId?: string
        sendVideo?: boolean
        sendAudio?: boolean
        useP2P?: boolean
        inputAudioDeviceId?: string
        autoGainControl?: boolean
        echoCancellation?: boolean
        noiseSuppression?: boolean
        sampleRate?: number
    }>((state) => {
        if (state.globals.localDeviceId) {
            const localDevice = state.devices.byId[state.globals.localDeviceId] as BrowserDevice
            return {
                inputVideoDeviceId: localDevice.inputVideoDeviceId,
                sendVideo: localDevice.sendVideo,
                sendAudio: localDevice.sendAudio,
                useP2P: localDevice.useP2P,
                inputAudioDeviceId: localDevice.inputAudioDeviceId,
                autoGainControl: localDevice.autoGainControl,
                echoCancellation: localDevice.echoCancellation,
                noiseSuppression: localDevice.noiseSuppression,
                sampleRate: localDevice.sampleRate,
            }
        }
        return {}
    }, shallowEqual)
    const stageId = useStageSelector<string>((state) => state.globals.stageId)
    const routerUrl = useStageSelector<string>((state) => {
        if (state.globals.stageId) {
            const stage = state.stages.byId[state.globals.stageId]
            if (stage.videoType === 'mediasoup' || stage.audioType === 'mediasoup') {
                return `${stage.mediasoup.url}:${stage.mediasoup.port}`
            }
        }
    })
    const [connection, setConnection] = React.useState<ConnectionState>(undefined)
    React.useEffect(() => {
        if (routerUrl && reportError) {
            let sendTransport: Transport
            let receiveTransport: Transport
            report(`Connecting to router ${routerUrl}`)
            const routerConnection = new TeckosClient(routerUrl, {
                reconnection: true,
            })
            const disconnect = () => {
                receiveTransport.close()
                sendTransport.close()
                routerConnection.disconnect()
            }
            routerConnection.on('disconnect', () => {
                report(`Disconnected from router`)
                disconnect()
            })
            routerConnection.on('connect', async () => {
                report(`Connected to router ${routerUrl}`)
                try {
                    const device = new MediasoupDevice()
                    const rtpCapabilities = await getRTPCapabilities(routerConnection)
                    await device.load({ routerRtpCapabilities: rtpCapabilities })
                    sendTransport = await createWebRTCTransport(routerConnection, device, 'send')
                    receiveTransport = await createWebRTCTransport(
                        routerConnection,
                        device,
                        'receive'
                    )
                    setConnection({
                        routerConnection,
                        sendTransport,
                        receiveTransport,
                        device: device,
                    })
                } catch (err) {
                    reportError(err)
                }
            })
            routerConnection.connect()

            return () => {
                report(`Disconnecting from router`)
                disconnect()
                setConnection(undefined)
            }
        }
    }, [reportError, routerUrl])

    const videoTracks = useStageSelector<MediasoupVideoTrack[]>((state) =>
        state.globals.stageId && state.videoTracks.byStage[state.globals.stageId]
            ? (state.videoTracks.byStage[state.globals.stageId]
                  .map((id) => state.videoTracks.byId[id])
                  .filter(
                      (track) =>
                          track.type === 'mediasoup' && track.stageDeviceId !== localStageDeviceId
                  ) as MediasoupVideoTrack[])
            : []
    )
    const setVideoConsumers = React.useContext(DispatchVideoConsumerContext)
    React.useEffect(() => {
        if (setVideoConsumers && connection?.routerConnection && connection.receiveTransport) {
            report('Sync video tracks', videoTracks)
            setVideoConsumers((prevState) => {
                // Clean up
                const existing: ConsumerList = Object.keys(prevState).reduce((prev, trackId) => {
                    if (videoTracks.find((track) => track._id === trackId)) {
                        return {
                            ...prev,
                            [trackId]: prevState[trackId],
                        }
                    }
                    return prev
                }, {})
                // Add new async (and add them later)
                videoTracks.map((track) => {
                    if (!prevState[track._id]) {
                        consume(
                            connection.routerConnection,
                            connection.receiveTransport,
                            connection.device,
                            track.producerId
                        ).then((consumer) =>
                            setVideoConsumers((prev) => ({ ...prev, [track._id]: consumer }))
                        )
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [connection, setVideoConsumers, videoTracks])

    const setVideoProducers = React.useContext(DispatchVideoProducerContext)
    React.useEffect(() => {
        if (emit && reportError && connection && stageId && !useP2P && sendVideo) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producers: Producer[] = []
            let publishedIds: string[] = []
            getVideoTracks(inputVideoDeviceId).then((tracks) =>
                tracks.map(async (track) => {
                    let producer: Producer
                    if (!abort) {
                        producer = await createProducer(sendTransport, track)
                        producers.push(producer)
                    }
                    if (!abort && producer.paused) {
                        report(`Video producer ${producer.id} is paused`)
                        producer.resume()
                    }
                    if (!abort) {
                        const { _id } = await publishProducer(emit, stageId, producer.id, 'video')
                        report(`Published video track ${_id}`)
                        publishedIds.push(_id)
                        setVideoProducers((prev) => ({
                            ...prev,
                            [_id]: producer,
                        }))
                    }
                })
            )
            return () => {
                abort = true
                producers.map((producer) => {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(err)
                    )
                })
                publishedIds.map((publishedId) => {
                    report(`Unpublished video track ${publishedId}`)
                    unpublishProducer(emit, publishedId, 'video').catch((err) => reportError(err))
                    setVideoProducers((prev) => omit(prev, publishedId))
                })
            }
        }
    }, [
        emit,
        connection,
        stageId,
        setVideoProducers,
        reportError,
        useP2P,
        sendVideo,
        inputVideoDeviceId,
    ])

    const audioTracks = useStageSelector<MediasoupAudioTrack[]>((state) =>
        state.globals.stageId && state.audioTracks.byStage[state.globals.stageId]
            ? (state.audioTracks.byStage[state.globals.stageId]
                  .map((id) => state.audioTracks.byId[id])
                  .filter(
                      (track) =>
                          track.type === 'mediasoup' && track.stageDeviceId !== localStageDeviceId
                  ) as MediasoupAudioTrack[])
            : []
    )

    const setAudioConsumers = React.useContext(DispatchAudioConsumerContext)
    React.useEffect(() => {
        if (setAudioConsumers && connection?.routerConnection && connection.receiveTransport) {
            report('Sync audio tracks', audioTracks)
            setAudioConsumers((prevState) => {
                // Clean up
                const existing: ConsumerList = Object.keys(prevState).reduce((prev, trackId) => {
                    if (audioTracks.find((track) => track._id === trackId)) {
                        return {
                            ...prev,
                            [trackId]: prevState[trackId],
                        }
                    }
                    return prev
                }, {})
                // Add new async (and add them later)
                audioTracks.map((track) => {
                    if (!prevState[track._id]) {
                        consume(
                            connection.routerConnection,
                            connection.receiveTransport,
                            connection.device,
                            track.producerId
                        ).then((consumer) =>
                            setAudioConsumers((prev) => ({ ...prev, [track._id]: consumer }))
                        )
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [audioTracks, connection, setAudioConsumers])

    const setAudioProducers = React.useContext(DispatchAudioProducerContext)
    React.useEffect(() => {
        if (emit && reportError && connection && stageId && !useP2P && sendAudio) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producers: Producer[] = []
            let publishedIds: string[] = []
            getAudioTracks({
                inputAudioDeviceId,
                autoGainControl,
                echoCancellation,
                noiseSuppression,
                sampleRate,
            }).then((tracks) =>
                tracks.map(async (track) => {
                    let producer: Producer
                    if (!abort) {
                        producer = await createProducer(sendTransport, track)
                        producers.push(producer)
                    }
                    if (!abort && producer.paused) {
                        report(`Audio producer ${producer.id} is paused`)
                        producer.resume()
                    }
                    if (!abort) {
                        const { _id } = await publishProducer(emit, stageId, producer.id, 'audio')
                        report(`Published audio track ${_id}`)
                        publishedIds.push(_id)
                        setAudioProducers((prev) => ({
                            ...prev,
                            [_id]: producer,
                        }))
                    }
                })
            )
            return () => {
                abort = true
                producers.map((producer) => {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(err)
                    )
                })
                publishedIds.map((publishedId) => {
                    report(`Unpublished audio track ${publishedId}`)
                    unpublishProducer(emit, publishedId, 'audio').catch((err) => reportError(err))
                    setAudioProducers((prev) => omit(prev, publishedId))
                })
            }
        }
    }, [
        emit,
        connection,
        stageId,
        reportError,
        useP2P,
        sendAudio,
        inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
        setAudioProducers,
    ])

    return null
}
MediasoupService.whyDidYouRender = true
export { MediasoupService, MediasoupProvider, useVideoProducers, useVideoConsumers }

import {ITeckosClient, TeckosClient} from 'teckos-client'
import {Device as MediasoupDevice} from 'mediasoup-client/lib/Device'
import {
    consume,
    createProducer,
    createWebRTCTransport,
    getRTPCapabilities,
    publishProducer,
    stopProducer,
    unpublishProducer,
} from './util'

import React from 'react'
import {MediasoupAudioTrack, MediasoupVideoTrack} from '@digitalstage/api-types'
import {Transport} from 'mediasoup-client/lib/Transport'
import {Producer} from 'mediasoup-client/lib/Producer'
import {Consumer} from 'mediasoup-client/lib/Consumer'
import {logger} from '../../logger'
import {useEmit} from '../ConnectionService'
import {useErrorReporting} from '../../hooks/useErrorReporting'
import {useStageSelector} from '../../redux/selectors/useStageSelector'
import {useWebcam} from '../../provider/WebcamProvider'
import {useMicrophone} from '../../provider/MicrophoneProvider'

const {trace} = logger('MediasoupService')

type ConnectionState = {
    routerConnection: ITeckosClient
    sendTransport: Transport
    receiveTransport: Transport
    device: MediasoupDevice
}

type ConsumerList = { [trackId: string]: Consumer }
type DispatchConsumersList = React.Dispatch<React.SetStateAction<ConsumerList>>

const VideoConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchVideoConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const AudioConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchAudioConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const MediasoupProvider = ({children}: { children: React.ReactNode }) => {
    const [videoConsumers, setVideoConsumers] = React.useState<ConsumerList>({})
    const [audioConsumers, setAudioConsumers] = React.useState<ConsumerList>({})

    return (
        <DispatchVideoConsumerContext.Provider value={setVideoConsumers}>
            <VideoConsumerContext.Provider value={videoConsumers}>
                <DispatchAudioConsumerContext.Provider value={setAudioConsumers}>
                    <AudioConsumerContext.Provider value={audioConsumers}>
                        {children}
                    </AudioConsumerContext.Provider>
                </DispatchAudioConsumerContext.Provider>
            </VideoConsumerContext.Provider>
        </DispatchVideoConsumerContext.Provider>
    )
}
const useVideoConsumers = (): ConsumerList => {
    const state = React.useContext(VideoConsumerContext)
    if (state === undefined)
        throw new Error('useVideoConsumers must be used within a MediasoupProvider')
    return state
}
const useAudioConsumers = (): ConsumerList => {
    const state = React.useContext(AudioConsumerContext)
    if (state === undefined)
        throw new Error('useAudioConsumers must be used within a MediasoupProvider')
    return state
}

const MediasoupService = () => {
    const emit = useEmit()
    const reportError = useErrorReporting()
    const localStageDeviceId = useStageSelector<string>((state) => state.globals.localStageDeviceId)
    const useP2P = useStageSelector<boolean>(state => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].useP2P : false)
    const stageId = useStageSelector<string>((state) => state.globals.stageId)
    const routerUrl = useStageSelector<string>((state) => {
        if (state.globals.stageId) {
            const {audioType, videoType, mediasoup} = state.stages.byId[state.globals.stageId]
            if ((videoType === 'mediasoup' || audioType === 'mediasoup') && mediasoup?.url && mediasoup?.port) {
                return `${mediasoup.url}:${mediasoup.port}`
            }
        }
        return undefined
    })
    const audioType = useStageSelector((state) =>
        state.globals.stageId ? state.stages.byId[state.globals.stageId].audioType : undefined
    )
    const videoType = useStageSelector((state) =>
        state.globals.stageId ? state.stages.byId[state.globals.stageId].videoType : undefined
    )
    const [connection, setConnection] = React.useState<ConnectionState>(undefined)
    React.useEffect(() => {
        if (routerUrl && reportError) {
            let sendTransport: Transport
            let receiveTransport: Transport
            trace(`Connecting to router ${routerUrl}`)
            const routerConnection = new TeckosClient(routerUrl, {
                reconnection: true,
            })
            const disconnect = () => {
                receiveTransport?.close()
                sendTransport?.close()
                routerConnection?.disconnect()
            }
            routerConnection.on('disconnect', () => {
                trace(`Disconnected from router`)
                disconnect()
            })
            routerConnection.on('connect', async () => {
                trace(`Connected to router ${routerUrl}`)
                try {
                    const device = new MediasoupDevice()
                    const rtpCapabilities = await getRTPCapabilities(routerConnection)
                    await device.load({routerRtpCapabilities: rtpCapabilities})
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
                trace(`Disconnecting from router`)
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
            trace('Sync video tracks', videoTracks)
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
                            setVideoConsumers((prev) => ({...prev, [track._id]: consumer}))
                        )
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [connection, setVideoConsumers, videoTracks])

    const localVideoTrack = useWebcam()
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            connection &&
            stageId &&
            videoType === 'mediasoup' &&
            localVideoTrack &&
            !useP2P
        ) {
            const {sendTransport} = connection
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            const track = localVideoTrack.clone()
            trace(`Publishing local video`)
            ;(async () => {
                try {
                    if (!abort) {
                        producer = await createProducer(sendTransport, track)
                    }
                    if (!abort && producer.paused) {
                        trace(`Video producer ${producer.id} is paused`)
                        producer.resume()
                    }
                    if (!abort) {
                        const {_id} = await publishProducer(emit, stageId, producer.id, 'video')
                        publishedId = _id
                        trace(`Published local video track with trackId ${track.id} as video ${publishedId}`)
                    }
                } catch (err) {
                    reportError(`Could not publish local video track ${track.id}. Reason: ${err}`)
                }
            })()
            return () => {
                abort = true
                if (publishedId) {
                    unpublishProducer(emit, publishedId, 'video')
                        .then(() => trace(`Un-published local video track ${track.id} published as video ${publishedId}`))
                        .catch((err) => reportError(
                            `Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${err}`
                        ))
                }
                if (producer) {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(
                            `Could not stop producer ${producer.id} of local video track ${track?.id} published as video ${publishedId}. Reason: ${err}`
                        )
                    )
                }
                if (track) {
                    track.stop()
                }
            }
        }
    }, [emit, connection, stageId, reportError, useP2P, videoType, localVideoTrack])

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
            trace('Sync audio tracks', audioTracks)
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
                            setAudioConsumers((prev) => ({...prev, [track._id]: consumer}))
                        )
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [audioTracks, connection, setAudioConsumers])

    const localAudioTrack = useMicrophone()
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            connection &&
            stageId &&
            audioType === 'mediasoup' &&
            !useP2P &&
            localAudioTrack
        ) {
            const {sendTransport} = connection
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            const track = localAudioTrack.clone()
            trace(`Publishing local audio`)
            ;(async () => {
                try {
                    if (!abort) {
                        producer = await createProducer(sendTransport, track)
                    }
                    if (!abort && producer.paused) {
                        trace(`Audio producer ${producer.id} is paused`)
                        producer.resume()
                    }
                    if (!abort) {
                        const {_id} = await publishProducer(emit, stageId, producer.id, 'audio')
                        publishedId = _id
                        trace(`Published local audio track with trackId ${track.id} as video ${publishedId}`)
                    }
                } catch (err) {
                    reportError(`Could not publish local audio track ${track.id}. Reason: ${err}`)
                }
            })()
            return () => {
                abort = true
                if (publishedId) {
                    unpublishProducer(emit, publishedId, 'audio')
                        .then(() => trace(`Un-published local audio track ${track.id}, published as audio ${publishedId}`))
                        .catch((err) => reportError(
                            `Could not un-publish local audio track ${track?.id} published as audio ${publishedId}. Reason: ${err}`
                        ))
                }
                if (producer) {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(
                            `Could not stop producer ${producer.id} of local audio track ${track?.id} published as audio ${publishedId}. Reason: ${err}`
                        )
                    )
                }
                if (track) {
                    track.stop()
                }
            }
        }
    }, [emit, connection, stageId, reportError, useP2P, audioType, localAudioTrack])

    return null
}
export {
    MediasoupService,
    MediasoupProvider,
    useVideoConsumers,
    useAudioConsumers,
}

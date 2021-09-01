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

import React from 'react'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'
import { MediasoupAudioTrack, MediasoupVideoTrack } from '@digitalstage/api-types'
import { Transport } from 'mediasoup-client/lib/Transport'
import { getVideoTrack } from '../../utils/getVideoTrack'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { getAudioTrack } from '../../utils/getAudioTrack'
import { logger } from '../../logger'

const { trace } = logger('MediasoupService')

type ConnectionState = {
    routerConnection: ITeckosClient
    sendTransport: Transport
    receiveTransport: Transport
    device: MediasoupDevice
}

type ConsumerList = { [trackId: string]: Consumer }
type DispatchProducer = React.Dispatch<React.SetStateAction<Producer>>
type DispatchConsumersList = React.Dispatch<React.SetStateAction<ConsumerList>>

const VideoProducerContext = React.createContext<Producer>(undefined)
const DispatchVideoProducerContext = React.createContext<DispatchProducer>(undefined)
const VideoConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchVideoConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const AudioProducerContext = React.createContext<Producer>(undefined)
const DispatchAudioProducerContext = React.createContext<DispatchProducer>(undefined)
const AudioConsumerContext = React.createContext<ConsumerList>(undefined)
const DispatchAudioConsumerContext = React.createContext<DispatchConsumersList>(undefined)
const MediasoupProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoProducers, setVideoProducers] = React.useState<Producer>()
    const [videoConsumers, setVideoConsumers] = React.useState<ConsumerList>({})
    const [audioProducers, setAudioProducers] = React.useState<Producer>()
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
const useVideoProducer = (): Producer => {
    return React.useContext(VideoProducerContext)
}
const useVideoConsumers = (): ConsumerList => {
    const state = React.useContext(VideoConsumerContext)
    if (state === undefined)
        throw new Error('useVideoConsumers must be used within a MediasoupProvider')
    return state
}
const useAudioProducer = (): Producer => {
    return React.useContext(AudioProducerContext)
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
            const { audioType, videoType, mediasoup } = state.stages.byId[state.globals.stageId]
            if (videoType === 'mediasoup' || audioType === 'mediasoup') {
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
                receiveTransport.close()
                sendTransport.close()
                routerConnection.disconnect()
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

    const setVideoProducer = React.useContext(DispatchVideoProducerContext)
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            connection &&
            stageId &&
            videoType === 'mediasoup' &&
            !useP2P &&
            sendVideo &&
            setVideoProducer
        ) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            getVideoTrack(inputVideoDeviceId).then(async (track) => {
                if (!abort) {
                    producer = await createProducer(sendTransport, track)
                }
                if (!abort && producer.paused) {
                    trace(`Video producer ${producer.id} is paused`)
                    producer.resume()
                }
                if (!abort) {
                    const { _id } = await publishProducer(emit, stageId, producer.id, 'video')
                    trace(`Published video track ${_id}`)
                    publishedId = _id
                    setVideoProducer(producer)
                }
            })
            return () => {
                abort = true
                if (publishedId) {
                    unpublishProducer(emit, publishedId, 'video')
                        .then(() => trace(`Unpublished video track ${publishedId}`))
                        .catch((err) => reportError(err))
                }
                if (producer) {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(err)
                    )
                    setVideoProducer(undefined)
                }
            }
        }
    }, [
        emit,
        connection,
        stageId,
        setVideoProducer,
        reportError,
        useP2P,
        sendVideo,
        inputVideoDeviceId,
        videoType,
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

    const setAudioProducer = React.useContext(DispatchAudioProducerContext)
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            connection &&
            stageId &&
            audioType === 'mediasoup' &&
            !useP2P &&
            sendAudio &&
            setAudioProducer
        ) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            getAudioTrack({
                inputAudioDeviceId,
                autoGainControl,
                echoCancellation,
                noiseSuppression,
                sampleRate,
            }).then(async (track) => {
                if (!abort) {
                    producer = await createProducer(sendTransport, track)
                }
                if (!abort && producer.paused) {
                    trace(`Audio producer ${producer.id} is paused`)
                    producer.resume()
                }
                if (!abort) {
                    const { _id } = await publishProducer(emit, stageId, producer.id, 'audio')
                    trace(`Published audio track ${_id}`)
                    publishedId = _id
                    setAudioProducer(producer)
                }
            })
            return () => {
                abort = true
                if (publishedId) {
                    unpublishProducer(emit, publishedId, 'audio')
                        .then(() => trace(`Unpublished audio track ${publishedId}`))
                        .catch((err) => reportError(err))
                }
                if (producer) {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(err)
                    )
                    setAudioProducer(undefined)
                }
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
        audioType,
        setAudioProducer,
    ])

    return null
}
export {
    MediasoupService,
    MediasoupProvider,
    useVideoProducer,
    useVideoConsumers,
    useAudioConsumers,
    useAudioProducer,
}

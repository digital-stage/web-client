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
    const [routerConnection, setRouterConnection] = React.useState<ITeckosClient>()
    const [device, setDevice] = React.useState<MediasoupDevice>()
    const [sendTransport, setSendTransport] = React.useState<Transport>()
    const [receiveTransport, setReceiveTransport] = React.useState<Transport>()

    React.useEffect(() => {
        if (routerConnection && device && reportError) {
            let abort = false
            let createdSendTransport
            createWebRTCTransport(routerConnection, device, 'send')
                .then(transport => {
                    createdSendTransport = transport
                    transport.on('connectionstatechange', async (state) => {
                        if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                            reportError(`Send transport has been ${state} by router`)
                            setSendTransport(undefined)
                        }
                    })
                    if (!abort) {
                        setSendTransport(transport)
                    }
                })
            return () => {
                abort = true
                setSendTransport(undefined)
                trace("Closing send transport")
                createdSendTransport?.close()
            }
        }
    }, [device, routerConnection, reportError])

    React.useEffect(() => {
        if (routerConnection && device && reportError) {
            let abort = false
            let createdReceiveTransport
            createWebRTCTransport(routerConnection, device, 'receive')
                .then(transport => {
                    createdReceiveTransport = transport
                    transport.on('connectionstatechange', async (state) => {
                        if (state === 'closed' || state === 'failed' || state === 'disconnected') {
                            reportError(`Receive transport has been ${state} by router`)
                            setReceiveTransport(undefined)
                        }
                    })
                    if (!abort) {
                        setReceiveTransport(transport)
                    }
                })
            return () => {
                abort = true
                setReceiveTransport(undefined)
                createdReceiveTransport?.close()
            }
        }
    }, [device, reportError, routerConnection])

    React.useEffect(() => {
        if (routerUrl && reportError) {
            let abort = false
            let createdRouterConnection: ITeckosClient
            let createdDevice: MediasoupDevice
            const disconnect = () => {
                createdRouterConnection?.disconnect()
                setRouterConnection(undefined)
            }
            createdRouterConnection = new TeckosClient(routerUrl, {
                reconnection: true,
            })
            createdRouterConnection.on('disconnect', () => {
                trace(`Disconnected from router`)
                disconnect()
            })
            createdRouterConnection.on('connect', async () => {
                trace(`Connected to router ${routerUrl}`)
                setRouterConnection(createdRouterConnection)
                createdDevice = new MediasoupDevice()
                return getRTPCapabilities(createdRouterConnection)
                    .then(async (routerRtpCapabilities) => {
                        if (!abort) {
                            await createdDevice.load({routerRtpCapabilities: routerRtpCapabilities})
                            setDevice(createdDevice)
                        }
                    })
                    .catch((err) => {
                        reportError(err)
                    })
            })
            createdRouterConnection.connect()
            return () => {
                abort = true
                setDevice(undefined)
                setRouterConnection(undefined)
                disconnect()
            }
        }
    }, [routerUrl, reportError])

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
        if (setVideoConsumers && routerConnection && device && receiveTransport && reportError) {
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
                            routerConnection,
                            receiveTransport,
                            device,
                            track.producerId
                        ).then((consumer) => {
                                trace(`Consuming now video ${track.id} with producer ${track.producerId}`)
                                setVideoConsumers((prev) => ({...prev, [track._id]: consumer}))
                            }
                        ).catch(err => reportError(err))
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [device, receiveTransport, reportError, routerConnection, setVideoConsumers, videoTracks])

    const localVideoTrack = useWebcam()
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            routerConnection &&
            sendTransport &&
            stageId &&
            videoType === 'mediasoup' &&
            localVideoTrack &&
            !useP2P
        ) {
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            let timeout
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
                        trace(`Published local video track ${track.id}/producer ${producer.id} as video ${publishedId}`)
                    }
                } catch (err) {
                    reportError(`Could not produce or publish local video track ${track.id}. Reason: ${err}`)
                }
            })()
            return () => {
                abort = true
                if (timeout) {
                    clearTimeout(timeout)
                }
                if (emit && publishedId) {
                    unpublishProducer(emit, publishedId, 'video')
                        .then(() => trace(`Un-published local video track ${track.id} published as video ${publishedId}`))
                        .catch((err) => reportError(
                            `Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${err}`
                        ))
                }
                if (routerConnection && producer) {
                    stopProducer(routerConnection, producer).catch((err) =>
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
    }, [emit, stageId, reportError, useP2P, videoType, localVideoTrack, routerConnection, sendTransport])

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
        if (setAudioConsumers && device && routerConnection && receiveTransport && reportError) {
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
                            routerConnection,
                            receiveTransport,
                            device,
                            track.producerId
                        ).then((consumer) => {
                                trace(`Consuming now audio ${track.id} with producer ${track.producerId}`)
                                setAudioConsumers((prev) => ({...prev, [track._id]: consumer}))
                            }
                        ).catch(err => reportError(err))
                    }
                })
                return {
                    ...existing,
                }
            })
        }
    }, [audioTracks, device, receiveTransport, reportError, routerConnection, setAudioConsumers])

    const localAudioTrack = useMicrophone()
    React.useEffect(() => {
        if (
            emit &&
            reportError &&
            routerConnection &&
            sendTransport &&
            stageId &&
            audioType === 'mediasoup' &&
            !useP2P &&
            localAudioTrack
        ) {
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
                        trace(`Published local audio track ${track.id}/producer ${producer.id} as audio ${publishedId}`)
                    }
                } catch (err) {
                    reportError(`Could not produce or publish local audio track ${track.id}. Reason: ${err}`)
                }
            })()
            return () => {
                abort = true
                if (emit && publishedId) {
                    unpublishProducer(emit, publishedId, 'audio')
                        .then(() => trace(`Un-published local audio track ${track.id}, published as audio ${publishedId}`))
                        .catch((err) => reportError(
                            `Could not un-publish local audio track ${track?.id} published as audio ${publishedId}. Reason: ${err}`
                        ))
                }
                if (routerConnection && producer) {
                    stopProducer(routerConnection, producer).catch((err) =>
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
    }, [emit, stageId, useP2P, audioType, localAudioTrack, sendTransport, routerConnection, reportError])

    return null
}
export {
    MediasoupService,
    MediasoupProvider,
    useVideoConsumers,
    useAudioConsumers,
}

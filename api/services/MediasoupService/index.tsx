import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
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
import { MediasoupVideoTrack, Stage } from '@digitalstage/api-types'
import { Transport } from 'mediasoup-client/lib/Transport'
import { getVideoTracks } from '../../utils/getVideoTracks'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'

const report = debug('MediasoupService')
const reportError = report.extend('error')

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
const MediasoupProvider = ({ children }: { children: React.ReactNode }) => {
    const [videoProducers, setVideoProducers] = React.useState<ProducerList>({})
    const [videoConsumers, setVideoConsumers] = React.useState<ConsumerList>({})

    report(videoProducers)
    report(videoConsumers)

    return (
        <DispatchVideoProducerContext.Provider value={setVideoProducers}>
            <VideoProducerContext.Provider value={videoProducers}>
                <DispatchVideoConsumerContext.Provider value={setVideoConsumers}>
                    <VideoConsumerContext.Provider value={videoConsumers}>
                        {children}
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
    const localStageDeviceId = useStageSelector<string>((state) => state.globals.localStageDeviceId)
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
    const routerUrl = React.useMemo<string | undefined>(() => {
        if (
            stage &&
            (stage?.videoType === 'mediasoup' || stage?.audioType === 'mediasoup') &&
            stage.mediasoup
        ) {
            return `${stage.mediasoup.url}:${stage.mediasoup.port}`
        }
        return undefined
    }, [stage])
    const [connection, setConnection] = React.useState<ConnectionState>(undefined)
    React.useEffect(() => {
        if (routerUrl) {
            let transports: Transport[] = []
            report(`Connecting to router ${routerUrl}`)
            const routerConnection = new TeckosClient(routerUrl, {
                reconnection: true,
            })
            const disconnect = () => {
                transports.map((transport) => transport.close())
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
                    transports = await Promise.all([
                        createWebRTCTransport(routerConnection, device, 'send'),
                        createWebRTCTransport(routerConnection, device, 'receive'),
                    ])
                    setConnection({
                        routerConnection,
                        sendTransport: transports[0],
                        receiveTransport: transports[1],
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
    }, [routerUrl])

    const videoTracks = useStageSelector<MediasoupVideoTrack[]>((state) =>
        stage?.videoType === 'mediasoup' && state.videoTracks.byStage[stage._id]
            ? (state.videoTracks.byStage[stage._id]
                  .map((id) => state.videoTracks.byId[id])
                  .filter((track) => track.type === 'mediasoup') as MediasoupVideoTrack[])
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
        if (
            emit &&
            connection &&
            stage?._id &&
            !localDevice.useP2P &&
            localStageDeviceId &&
            localDevice?.sendVideo
        ) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producers: Producer[] = []
            let publishedIds: string[] = []
            getVideoTracks(localDevice.inputVideoDeviceId).then((tracks) =>
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
                        const { _id } = await publishProducer(emit, stage._id, producer.id, 'video')
                        report(`Published video producer ${producer.id}`)
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
                    unpublishProducer(emit, publishedId, 'video').catch((err) => reportError(err))
                })
            }
        }
    }, [
        localStageDeviceId,
        emit,
        connection,
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        stage?._id,
        setVideoProducers,
    ])

    return null
}
export { MediasoupService, MediasoupProvider, useVideoProducers, useVideoConsumers }

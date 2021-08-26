import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import { ITeckosClient, TeckosClient } from 'teckos-client'
import { Device as MediasoupDevice } from 'mediasoup-client/lib/Device'
import {
    createProducer,
    createWebRTCTransport,
    getRTPCapabilities,
    publishProducer,
    stopProducer,
    unpublishProducer,
} from './util'
import debug from 'debug'
import React, { useEffect, useMemo, useState } from 'react'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'
import { MediasoupAudioTrack, MediasoupVideoTrack, Stage } from '@digitalstage/api-types'
import { Transport } from 'mediasoup-client/lib/Transport'
import getVideoTracks from '../../utils/getVideoTracks'
import { Producer } from 'mediasoup-client/lib/Producer'
import { useDispatchTracks } from '../../provider/TrackProvider'

const report = debug('mediasoup')
const reportError = report.extend('error')

const MediasoupService = () => {
    report('RERENDER')
    const emit = useEmit()
    const localDevice = useStageSelector<BrowserDevice | undefined>(
        (state) =>
            state.globals.localDeviceId
                ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice)
                : undefined,
        shallowEqual
    )
    const localStageDeviceId = useStageSelector<string>((state) => state.globals.localStageDeviceId)
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
    const [connection, setConnection] = useState<{
        routerConnection: ITeckosClient
        sendTransport: Transport
        receiveTransport: Transport
        device: MediasoupDevice
    }>(undefined)
    useEffect(() => {
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
                    console.log('CONNECTING HERE')
                    transports = await Promise.all([
                        createWebRTCTransport(routerConnection, device, 'send'),
                        createWebRTCTransport(routerConnection, device, 'receive'),
                    ])
                    setConnection({
                        routerConnection,
                        sendTransport: transports[0],
                        receiveTransport: transports[0],
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

    const dispatchTracks = useDispatchTracks()
    const videoProducers = useStageSelector((state) => state.mediasoup.videoProducers)
    useEffect(() => {
        if (
            emit &&
            connection &&
            stage?._id &&
            localStageDeviceId &&
            localDevice?.sendVideo &&
            !localDevice.useP2P
        ) {
            const { sendTransport } = connection
            let abort: boolean = false
            let producer: Producer
            let publishedId: string
            getVideoTracks(localDevice.inputVideoDeviceId).then((tracks) =>
                tracks.map(async (track) => {
                    if (!abort) {
                        producer = await createProducer(sendTransport, track)
                    }
                    if (!abort && producer.paused) {
                        report(`Video producer ${producer.id} is paused`)
                        producer.resume()
                    }
                    if (!abort) {
                        const { _id } = await publishProducer(emit, stage._id, producer)
                        report(`Published video producer ${producer.id}`)
                        publishedId = _id
                        dispatchTracks({
                            type: 'addLocalVideoTrack',
                            id: localStageDeviceId,
                            track: producer.track,
                        })
                    }
                })
            )
            return () => {
                abort = true
                if (producer) {
                    stopProducer(connection.routerConnection, producer).catch((err) =>
                        reportError(err)
                    )
                    if (publishedId) {
                        unpublishProducer(emit, producer, publishedId).catch((err) =>
                            reportError(err)
                        )
                    }
                }
            }
        }
    }, [
        dispatchTracks,
        localStageDeviceId,
        emit,
        connection,
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        stage?._id,
    ])

    return null
}
export { MediasoupService }

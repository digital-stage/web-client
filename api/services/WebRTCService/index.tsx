import React from 'react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import { shallowEqual } from 'react-redux'
import { WebRTCConnection } from './WebRTCConnection'
import { getVideoTracks } from '../../utils/getVideoTracks'
import omit from 'lodash/omit'
import debug from 'debug'
import { useConnection } from '../../hooks/useConnection'
import { useStageSelector } from 'api/redux/useStageSelector'
import { useDispatchTracks, useTracks } from '../../provider/TrackProvider'

const report = debug('WebRTCService')
const logger = {
    trace: report,
    error: report.extend('error'),
}

type Action = {type: "send-video",  }
type State = {
    peerConnections: {
        [stageDeviceId: string]: WebRTCConnection
    },
    remoteVideoTracks: {
        [trackId: string]:
    }
}
function reducePeerConnections() {

}

const WebRTCService = () => {
    report('RERENDER')
    const connection = useConnection()
    const dispatchTracks = useDispatchTracks()
    const emit = connection ? connection.emit : undefined
    const [ready, setReady] = React.useState<boolean>(false)
    const localStageDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localStageDeviceId
    )
    const localDevice = useStageSelector<Device | undefined>(
        (state) =>
            state.globals.localDeviceId
                ? state.devices.byId[state.globals.localDeviceId]
                : undefined,
        shallowEqual
    )
    const stageId = useStageSelector((state) => state.globals.stageId)
    const videoType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].videoType : undefined
    )
    const stageDeviceIds = useStageSelector<string[]>((state) =>
        localStageDeviceId
            ? state.stageDevices.byStage[stageId]?.filter(
                  (id) => id !== localStageDeviceId && state.stageDevices.byId[id].active
              ) || []
            : []
    )
    const [peerConnections, setPeerConnections] = React.useState<{
        [stageDeviceId: string]: WebRTCConnection
    }>({})

    React.useEffect(() => {
        if (connection && dispatchTracks && localStageDeviceId && stageId) {
            const handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
                logger.trace('Received offer from ' + from)
                setPeerConnections((prev) => {
                    logger.trace(prev)
                    if (!prev[from]) {
                        prev[from] = new WebRTCConnection(
                            localStageDeviceId,
                            from,
                            connection.emit,
                            (track) => {
                                if (track.kind === 'video') {
                                    logger.trace('Got new remote video from ' + stageId)
                                    dispatchTracks({
                                        type: 'addRemoteVideoTrack',
                                        id: localStageDeviceId,
                                        track,
                                    })
                                } else {
                                    logger.trace('Got new remote audio from ' + stageId)
                                    dispatchTracks({
                                        type: 'addRemoteAudioTrack',
                                        id: localStageDeviceId,
                                        track,
                                    })
                                }
                            }
                        )
                        prev[from].connect()
                    }
                    prev[from].addDescription(offer).catch((err) => logger.error(err))
                    return prev
                })
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                logger.trace('Received answer from ' + from)
                setPeerConnections((prev) => {
                    if (prev[from]) {
                        prev[from].addDescription(answer).catch((err) => logger.error(err))
                    }
                    return prev
                })
            }
            const handleIceCandidate = ({
                from,
                iceCandidate,
            }: ServerDevicePayloads.IceCandidateSent) =>
                setPeerConnections((prev) => {
                    if (prev[from]) {
                        prev[from].addIceCandidate(iceCandidate).catch((err) => logger.error(err))
                    }
                    return prev
                })
            connection.on(ServerDeviceEvents.P2POfferSent, handleOffer)
            connection.on(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
            connection.on(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
            setReady(true)
            return () => {
                setReady(false)
                connection.off(ServerDeviceEvents.P2POfferSent, handleOffer)
                connection.off(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
                connection.off(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
            }
        }
    }, [connection, dispatchTracks, localStageDeviceId, stageId])

    React.useEffect(() => {
        if (ready && emit && dispatchTracks && localStageDeviceId) {
            setPeerConnections((prevState) => {
                const cleanedUp = Object.keys(prevState).reduce((prev, key) => {
                    if (!stageDeviceIds.some((stageDeviceId) => stageDeviceId === key)) {
                        prev[key].close()
                        return omit(prev, key)
                    }
                    return {
                        ...prev,
                        [key]: prev[key],
                    }
                }, prevState)
                // Add stage device IDS
                stageDeviceIds.forEach((stageDeviceId) => {
                    if (!cleanedUp[stageDeviceId]) {
                        cleanedUp[stageDeviceId] = new WebRTCConnection(
                            localStageDeviceId,
                            stageDeviceId,
                            emit,
                            (track) => {
                                if (track.kind === 'video') {
                                    logger.trace('Got new remote video from ' + stageId)
                                    dispatchTracks({
                                        type: 'addRemoteVideoTrack',
                                        id: localStageDeviceId,
                                        track,
                                    })
                                } else {
                                    logger.trace('Got new remote audio from ' + stageId)
                                    dispatchTracks({
                                        type: 'addRemoteAudioTrack',
                                        id: localStageDeviceId,
                                        track,
                                    })
                                }
                            }
                        )
                        cleanedUp[stageDeviceId].connect()
                    }
                })
                return cleanedUp
            })
        }
    }, [dispatchTracks, emit, localStageDeviceId, ready, stageDeviceIds, stageId])

    /**
     * Capture local video track
     */
    const [state, dispatch] = React.useReducer()
    React.useEffect(() => {
        if (
            stageId &&
            videoType === 'mediasoup' &&
            localStageDeviceId &&
            localDevice?.sendVideo &&
            localDevice?.useP2P
        ) {
            logger.trace('Fetching video tracks')
            let abort = false
            let addedTracks: MediaStreamTrack[] = undefined
            let publishedIds: string[] = []
            const connections = Object.values(peerConnections)
            getVideoTracks(localDevice?.inputVideoDeviceId).then((tracks) => {
                if (abort) {
                    tracks.forEach((track) => track.stop())
                } else {
                    addedTracks = tracks
                    tracks.forEach((track) => {
                        emit(
                            ClientDeviceEvents.CreateVideoTrack,
                            {
                                stageId,
                                trackId: localStageDeviceId,
                                type: 'browser',
                            } as ClientDevicePayloads.CreateVideoTrack,
                            (error: string | null, videoTrack) => {
                                if (error) {
                                    logger.error(
                                        'Could not publish local video track. Reason: ' + error
                                    )
                                } else {
                                    logger.trace('Published local video track')
                                    publishedIds.push(videoTrack._id)
                                    dispatchTracks({
                                        type: 'addLocalVideoTrack',
                                        id: videoTrack._id,
                                        track,
                                    })
                                }
                            }
                        )
                        setPeerConnections(prev => {

                        })
                        connections.forEach((peerConnection) => peerConnection.addTrack(track))
                    })
                }
            })
            return () => {
                logger.trace('Cleaning up video tracks')
                abort = true
                publishedIds.map((publishedId) => {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                logger.error(
                                    'Could not UNpublish local video track. Reason: ' + error
                                )
                            } else {
                                logger.trace('UNpublished local video track')
                            }
                        }
                    )
                    dispatchTracks({ type: 'removeLocalVideoTrack', id: undefined })
                })
                if (addedTracks) {
                    addedTracks.map((track) => {
                        connections.forEach((peerConnection) =>
                            peerConnection.removeTrack(track.id)
                        )
                        track.stop()
                    })
                }
            }
        }
    }, [
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        stageId,
        localStageDeviceId,
        videoType,
        dispatchTracks,
        emit,
    ])

    const { localVideoTracks } = useTracks()

    React.useEffect(() => {
        //TODO: Attach tracks to
    }, [localVideoTracks])

    return null
}
export { WebRTCService }

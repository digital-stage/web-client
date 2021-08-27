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
import { useStageSelector } from 'api/redux/useStageSelector'
import { useConnection } from '../ConnectionService'

const report = debug('WebRTCService')
const logger = {
    trace: report,
    error: report.extend('error'),
}
type TrackList = MediaStreamTrack[]
type DispatchTrackList = React.Dispatch<React.SetStateAction<TrackList>>
type StageDeviceTrackList = { [stageDeviceId: string]: TrackList }
type DispatchStageDeviceTrackList = React.Dispatch<React.SetStateAction<StageDeviceTrackList>>

const RemoteVideoTracksContext = React.createContext<StageDeviceTrackList>(undefined)
const DispatchRemoteVideoTracksContext =
    React.createContext<DispatchStageDeviceTrackList>(undefined)
const LocalVideoTracksContext = React.createContext<TrackList>(undefined)
const DispatchLocalVideoTracksContext = React.createContext<DispatchTrackList>(undefined)
const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const [localVideoTracks, setLocalVideoTracks] = React.useState<TrackList>([])
    const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<StageDeviceTrackList>({})

    return (
        <DispatchLocalVideoTracksContext.Provider value={setLocalVideoTracks}>
            <LocalVideoTracksContext.Provider value={localVideoTracks}>
                <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
                    <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
                        {children}
                    </RemoteVideoTracksContext.Provider>
                </DispatchRemoteVideoTracksContext.Provider>
            </LocalVideoTracksContext.Provider>
        </DispatchLocalVideoTracksContext.Provider>
    )
}
const useLocalVideoTracks = (): TrackList => {
    const state = React.useContext(LocalVideoTracksContext)
    if (state === undefined)
        throw new Error('useLocalVideoTracks must be used within a WebRTCProvider')
    return state
}
const useRemoteVideoTracks = (): StageDeviceTrackList => {
    const state = React.useContext(RemoteVideoTracksContext)
    if (state === undefined)
        throw new Error('useRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}

const WebRTCService = () => {
    report('RERENDER')
    const connection = useConnection()
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
    const [, setPeerConnections] = React.useState<{
        [stageDeviceId: string]: WebRTCConnection
    }>({})

    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    React.useEffect(() => {
        if (connection && setRemoteVideoTracks && localStageDeviceId && stageId) {
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
                                    setRemoteVideoTracks((prev) => ({
                                        ...prev,
                                        [from]: [...prev[from], track],
                                    }))
                                    track.onended = () => {
                                        setRemoteVideoTracks((prev) => ({
                                            ...prev,
                                            [from]: prev[from].filter((t) => t.id === track.id),
                                        }))
                                    }
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
    }, [connection, localStageDeviceId, setRemoteVideoTracks, stageId])

    React.useEffect(() => {
        if (ready && emit && setRemoteVideoTracks && localStageDeviceId) {
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
                                    setRemoteVideoTracks((prev) => ({
                                        ...prev,
                                        [stageDeviceId]: [...prev[stageDeviceId], track],
                                    }))
                                    track.onended = () => {
                                        setRemoteVideoTracks((prev) => ({
                                            ...prev,
                                            [stageDeviceId]: prev[stageDeviceId].filter(
                                                (t) => t.id !== track.id
                                            ),
                                        }))
                                    }
                                }
                            }
                        )
                        cleanedUp[stageDeviceId].connect()
                    }
                })
                return cleanedUp
            })
        }
    }, [emit, localStageDeviceId, ready, setRemoteVideoTracks, stageDeviceIds, stageId])

    /**
     * Capture local video track
     */
    const setLocalVideoTracks = React.useContext(DispatchLocalVideoTracksContext)
    React.useEffect(() => {
        if (
            stageId &&
            videoType === 'mediasoup' &&
            setLocalVideoTracks &&
            localStageDeviceId &&
            localDevice?.sendVideo &&
            localDevice?.useP2P
        ) {
            logger.trace('Fetching video tracks')
            let abort = false
            let addedTracks: MediaStreamTrack[] = undefined
            let publishedIds: string[] = []
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
                                    setLocalVideoTracks((prev) => [...prev, track])
                                }
                            }
                        )
                        setPeerConnections((prev) => {
                            Object.values(prev).forEach((peerConnection) =>
                                peerConnection.addTrack(track)
                            )
                            return prev
                        })
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
                })
                if (addedTracks) {
                    addedTracks.map((track) => {
                        setPeerConnections((prev) => {
                            Object.values(prev).forEach((peerConnection) =>
                                peerConnection.removeTrack(track.id)
                            )
                            return prev
                        })
                        track.stop()
                        setLocalVideoTracks((prev) => prev.filter((t) => t.id !== track.id))
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
        emit,
        setLocalVideoTracks,
    ])

    return null
}
export { WebRTCService, WebRTCProvider, useLocalVideoTracks, useRemoteVideoTracks }

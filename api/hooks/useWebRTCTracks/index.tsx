import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import debug from 'debug'
import adapter from 'webrtc-adapter'
import WebRTCConnection, {
    SendDescription,
    SendIceCandidate,
} from '../../services/WebRTCService/WebRTCConnection'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import getVideoTracks from '../../services/utils/getVideoTracks'
import { shallowEqual } from 'react-redux'
import getAudioTracks from '../../services/utils/getAudioTracks'

const log = debug('WebRTCService')
const logWarning = log.extend('warn')
const logError = log.extend('error')

log(
    'Using ' +
        adapter.browserDetails.browser +
        ' with WebRTC version ' +
        adapter.browserDetails.version
)
type TrackList = {
    [trackId: string]: MediaStreamTrack
}

interface WebRTCContext {
    localVideoTracks: TrackList
    localAudioTracks: TrackList
    remoteVideoTracks: TrackList
    remoteAudioTracks: TrackList
}

const Context = createContext<WebRTCContext>({
    localVideoTracks: {},
    localAudioTracks: {},
    remoteAudioTracks: {},
    remoteVideoTracks: {},
})
const useWebRTCTracks = () => useContext<WebRTCContext>(Context)

const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const { connection, emit } = useConnection()
    const [ready, setReady] = useState<boolean>(false)
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack>()
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>()
    const [remoteVideoTracks, setRemoteVideoTracks] = useState<TrackList>({})
    const [remoteAudioTracks, setRemoteAudioTracks] = useState<TrackList>({})
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
    const stageDeviceIds = useStageSelector<string[]>((state) =>
        localStageDeviceId
            ? state.stageDevices.byStage[stageId]?.filter(
                  (id) => id !== localStageDeviceId && state.stageDevices.byId[id].active
              ) || []
            : []
    )
    const [, setPeerConnections] = useState<{
        [stageDeviceId: string]: WebRTCConnection
    }>({})

    useEffect(() => {
        if (connection) {
            log('Adding event handler to API connection')
            const handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
                log('Received offer from ' + from)
                setPeerConnections((prev) => {
                    log(prev)
                    if (prev[from]) {
                        prev[from].addDescription(offer)
                    }
                    return prev
                })
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                log('Received answer from ' + from)
                setPeerConnections((prev) => {
                    if (prev[from]) {
                        prev[from].addDescription(answer)
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
                        prev[from].addIceCandidate(iceCandidate)
                    }
                    return prev
                })
            connection.on(ServerDeviceEvents.P2POfferSent, handleOffer)
            connection.on(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
            connection.on(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
            setReady(true)
            return () => {
                log('Removing event handler to API connection')
                setReady(false)
                connection.off(ServerDeviceEvents.P2POfferSent, handleOffer)
                connection.off(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
                connection.off(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
            }
        }
    }, [connection])

    useEffect(() => {
        if (ready && emit && localStageDeviceId) {
            setPeerConnections((prevState) =>
                stageDeviceIds.reduce(
                    (prev, stageDeviceId) => {
                        let peerConnection = prev[stageDeviceId]
                        if (!peerConnection) {
                            // Create peer connection
                            const sendDescription: SendDescription = (description) => {
                                if (description.type === 'offer') {
                                    log('Sending offer to ' + stageDeviceId)
                                    return emit(ClientDeviceEvents.SendP2POffer, {
                                        from: localStageDeviceId,
                                        to: stageDeviceId,
                                        offer: description,
                                    } as ClientDevicePayloads.SendP2POffer)
                                }
                                log('Sending answer' + stageDeviceId)
                                return emit(ClientDeviceEvents.SendP2PAnswer, {
                                    from: localStageDeviceId,
                                    to: stageDeviceId,
                                    answer: description,
                                } as ClientDevicePayloads.SendP2PAnswer)
                            }
                            const sendIceCandidate: SendIceCandidate = (iceCandidate) =>
                                emit(ClientDeviceEvents.SendIceCandidate, {
                                    from: localStageDeviceId,
                                    to: stageDeviceId,
                                    iceCandidate: iceCandidate,
                                } as ClientDevicePayloads.SendIceCandidate)
                            peerConnection = new WebRTCConnection(
                                sendDescription,
                                sendIceCandidate,
                                localStageDeviceId.localeCompare(stageDeviceId) >= 0
                            )
                            peerConnection.onTrack = (track) => {
                                if (track.kind === 'video') {
                                    setRemoteVideoTracks((prev) => ({
                                        ...prev,
                                        [stageDeviceId]: track,
                                    }))
                                } else {
                                    setRemoteAudioTracks((prev) => ({
                                        ...prev,
                                        [stageDeviceId]: track,
                                    }))
                                }
                            }
                            peerConnection.connect()
                        }
                        return {
                            ...prev,
                            [stageDeviceId]: peerConnection,
                        }
                    },
                    Object.keys(prevState).reduce((prev, stageDeviceId) => {
                        // Remove deprecated
                        if (stageDeviceIds.find((id) => id !== stageDeviceId)) {
                            log('Removed obsolete peer connection to ' + stageDeviceId)
                            return { ...prev }
                        }
                        return {
                            ...prev,
                            [stageDeviceId]: prevState[stageDeviceId],
                        }
                    }, {})
                )
            )
        }
    }, [ready, emit, localStageDeviceId, stageDeviceIds])

    /**
     * Capture local video track
     */
    useEffect(() => {
        if (localDevice?.sendVideo && localDevice?.useP2P) {
            let abort = false
            let addedTrack
            getVideoTracks(localDevice?.inputVideoDeviceId)
                .then((tracks) => tracks.pop())
                .then((track) => {
                    if (abort) {
                        track.stop()
                    } else {
                        addedTrack = track
                        setLocalVideoTrack(track)
                    }
                })
            return () => {
                abort = true
                addedTrack?.stop()
                setLocalVideoTrack(undefined)
            }
        }
    }, [localDevice?.inputVideoDeviceId, localDevice?.sendVideo, localDevice?.useP2P])

    /**
     * Publish / Un-publish video tracks
     */
    useEffect(() => {
        if (emit && localStageDeviceId && stageId && localVideoTrack) {
            let publishedId
            emit(
                ClientDeviceEvents.CreateVideoTrack,
                {
                    stageId,
                    trackId: localStageDeviceId,
                    type: 'browser',
                } as ClientDevicePayloads.CreateVideoTrack,
                (error: string | null, videoTrack) => {
                    if (error) {
                        logError('Could not publish local video track. Reason: ' + error)
                    } else {
                        log('Published local video track')
                        publishedId = videoTrack._id
                    }
                }
            )
            return () => {
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                logError('Could not UNpublish local video track. Reason: ' + error)
                            } else {
                                log('UNpublished local video track')
                            }
                        }
                    )
                }
            }
        }
    }, [emit, localVideoTrack, localStageDeviceId, stageId])

    /**
     * Attach video tracks to all existing peer connections
     */
    useEffect(() => {
        setPeerConnections((prev) => {
            Object.values(prev).map((peerConnection) =>
                peerConnection.setVideoTrack(localVideoTrack)
            )
            return prev
        })
    }, [localVideoTrack])

    /**
     * Capture local audio track
     */
    useEffect(() => {
        if (localDevice?.sendAudio && localDevice?.useP2P) {
            let abort = false
            let addedTrack
            getAudioTracks({
                inputAudioDeviceId: localDevice.inputAudioDeviceId,
                autoGainControl: localDevice.autoGainControl,
                echoCancellation: localDevice.echoCancellation,
                noiseSuppression: localDevice.noiseSuppression,
                sampleRate: localDevice.sampleRate,
            })
                .then((tracks) => tracks.pop())
                .then((track) => {
                    if (abort) {
                        track.stop()
                    } else {
                        addedTrack = track
                        setLocalAudioTrack(track)
                    }
                })
            return () => {
                abort = true
                addedTrack?.stop()
                setLocalAudioTrack(undefined)
            }
        }
    }, [
        localDevice?.sendAudio,
        localDevice?.useP2P,
        localDevice?.inputAudioDeviceId,
        localDevice?.autoGainControl,
        localDevice?.echoCancellation,
        localDevice?.noiseSuppression,
        localDevice?.sampleRate,
    ])

    /**
     * Publish / Un-publish audio tracks
     */
    useEffect(() => {
        if (emit && localStageDeviceId && stageId && localAudioTrack) {
            let publishedId
            emit(
                ClientDeviceEvents.CreateAudioTrack,
                {
                    stageId,
                    trackId: localStageDeviceId,
                    type: 'browser',
                } as ClientDevicePayloads.CreateAudioTrack,
                (error: string | null, audioTrack) => {
                    if (error) {
                        logError('Could not publish local audio track. Reason: ' + error)
                    } else {
                        log('Published local audio track')
                        publishedId = audioTrack._id
                    }
                }
            )
            return () => {
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveAudioTrack,
                        publishedId as ClientDevicePayloads.RemoveAudioTrack,
                        (error: string | null) => {
                            if (error) {
                                logError('Could not UNpublish local audio track. Reason: ' + error)
                            } else {
                                log('UNpublished local audio track')
                            }
                        }
                    )
                }
            }
        }
    }, [emit, localAudioTrack, localStageDeviceId, stageId])

    /**
     * Attach audio tracks to all existing peer connections
     */
    useEffect(() => {
        setPeerConnections((prev) => {
            Object.values(prev).map((peerConnection) =>
                peerConnection.setAudioTrack(localAudioTrack)
            )
            return prev
        })
    }, [localAudioTrack])

    /**
     * Cache local states
     */
    const value = useMemo(
        () => ({
            localVideoTracks:
                localStageDeviceId && localVideoTrack
                    ? {
                          [localStageDeviceId]: localVideoTrack,
                      }
                    : {},
            localAudioTracks:
                localStageDeviceId && localAudioTrack
                    ? {
                          [localStageDeviceId]: localAudioTrack,
                      }
                    : {},
            remoteVideoTracks,
            remoteAudioTracks,
        }),
        [localAudioTrack, localStageDeviceId, localVideoTrack, remoteAudioTracks, remoteVideoTracks]
    )

    return <Context.Provider value={value}>{children}</Context.Provider>
}

export { WebRTCProvider }
export default useWebRTCTracks

import debug from 'debug'
import React, { createContext, useEffect, useMemo, useState } from 'react'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import { shallowEqual } from 'react-redux'
import WebRTCConnection from './WebRTCConnection'
import getVideoTracks from '../../utils/getVideoTracks'
import getAudioTracks from '../../utils/getAudioTracks'
import omit from 'lodash/omit'

const log = debug('WebRTCProvider')
const logError = log.extend('error')

type TrackList = {
    [trackId: string]: MediaStreamTrack
}

interface WebRTCContextT {
    localVideoTracks: TrackList
    localAudioTracks: TrackList
    remoteVideoTracks: TrackList
    remoteAudioTracks: TrackList
}

const WebRTCContext = createContext<WebRTCContextT>({
    localVideoTracks: {},
    localAudioTracks: {},
    remoteAudioTracks: {},
    remoteVideoTracks: {},
})

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
    const videoType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].videoType : undefined
    )
    const audioType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].audioType : undefined
    )
    const stageDeviceIds = useStageSelector<string[]>((state) =>
        localStageDeviceId
            ? state.stageDevices.byStage[stageId]?.filter(
                  (id) => id !== localStageDeviceId && state.stageDevices.byId[id].active
              ) || []
            : []
    )
    const [peerConnections, setPeerConnections] = useState<{
        [stageDeviceId: string]: WebRTCConnection
    }>({})

    useEffect(() => {
        if (connection && emit && localStageDeviceId && stageId) {
            const handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
                log('Received offer from ' + from)
                setPeerConnections((prev) => {
                    log(prev)
                    if (!prev[from]) {
                        prev[from] = new WebRTCConnection(
                            localStageDeviceId,
                            from,
                            emit,
                            (track) => {
                                if (track.kind === 'video') {
                                    log('Got new remote video from ' + stageId)
                                    setRemoteVideoTracks((prev) => ({
                                        ...prev,
                                        [from]: track,
                                    }))
                                } else {
                                    log('Got new remote audio from ' + stageId)
                                    setRemoteAudioTracks((prev) => ({
                                        ...prev,
                                        [from]: track,
                                    }))
                                }
                            }
                        )
                        prev[from].connect()
                    }
                    prev[from].addDescription(offer).catch((err) => logError(err))
                    return prev
                })
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                log('Received answer from ' + from)
                setPeerConnections((prev) => {
                    if (prev[from]) {
                        prev[from].addDescription(answer).catch((err) => logError(err))
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
                        prev[from].addIceCandidate(iceCandidate).catch((err) => logError(err))
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
    }, [connection, emit, localStageDeviceId, stageId])

    useEffect(() => {
        if (ready && emit && localStageDeviceId) {
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
                                    log('Got new remote video from ' + stageId)
                                    setRemoteVideoTracks((prev) => ({
                                        ...prev,
                                        [stageDeviceId]: track,
                                    }))
                                } else {
                                    log('Got new remote audio from ' + stageId)
                                    setRemoteAudioTracks((prev) => ({
                                        ...prev,
                                        [stageDeviceId]: track,
                                    }))
                                }
                            }
                        )
                        cleanedUp[stageDeviceId].connect()
                    }
                })
                return cleanedUp
            })
        }
    }, [emit, localStageDeviceId, ready, stageDeviceIds, stageId])

    /**
     * Capture local video track
     */
    useEffect(() => {
        if (
            emit &&
            stageId &&
            videoType === 'mediasoup' &&
            localStageDeviceId &&
            localDevice?.sendVideo &&
            localDevice?.useP2P
        ) {
            log('Fetching video tracks')
            let abort = false
            let addedTrack
            let publishedId
            getVideoTracks(localDevice?.inputVideoDeviceId)
                .then((tracks) => tracks.pop())
                .then((track) => {
                    if (abort) {
                        track.stop()
                    } else {
                        addedTrack = track
                        emit(
                            ClientDeviceEvents.CreateVideoTrack,
                            {
                                stageId,
                                trackId: localStageDeviceId,
                                type: 'browser',
                            } as ClientDevicePayloads.CreateVideoTrack,
                            (error: string | null, videoTrack) => {
                                if (error) {
                                    logError(
                                        'Could not publish local video track. Reason: ' + error
                                    )
                                } else {
                                    log('Published local video track')
                                    publishedId = videoTrack._id
                                }
                            }
                        )
                        log('SETTING VIDEO TRACK')
                        setLocalVideoTrack(track)
                    }
                })
            return () => {
                abort = true
                addedTrack?.stop()
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
                setLocalVideoTrack(undefined)
            }
        }
    }, [
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        emit,
        stageId,
        localStageDeviceId,
        videoType,
    ])

    /**
     * Capture local audio track
     */
    useEffect(() => {
        if (
            emit &&
            stageId &&
            audioType === 'mediasoup' &&
            localStageDeviceId &&
            localDevice?.sendAudio &&
            localDevice?.useP2P
        ) {
            let abort = false
            let addedTrack
            let publishedId
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
                        emit(
                            ClientDeviceEvents.CreateAudioTrack,
                            {
                                stageId,
                                trackId: localStageDeviceId,
                                type: 'browser',
                            } as ClientDevicePayloads.CreateAudioTrack,
                            (error: string | null, audioTrack) => {
                                if (error) {
                                    logError(
                                        'Could not publish local audio track. Reason: ' + error
                                    )
                                } else {
                                    log('Published local audio track')
                                    publishedId = audioTrack._id
                                }
                            }
                        )
                        setLocalAudioTrack(track)
                    }
                })
            return () => {
                abort = true
                addedTrack?.stop()
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
                setLocalAudioTrack(undefined)
            }
        }
    }, [
        audioType,
        localDevice?.sendAudio,
        localDevice?.useP2P,
        localDevice?.inputAudioDeviceId,
        localDevice?.autoGainControl,
        localDevice?.echoCancellation,
        localDevice?.noiseSuppression,
        localDevice?.sampleRate,
        emit,
        stageId,
        localStageDeviceId,
    ])

    useEffect(() => {
        if (localVideoTrack) {
            Object.values(peerConnections).forEach((peerConnection) =>
                peerConnection.setVideoTrack(localVideoTrack)
            )
        }
    }, [peerConnections, localVideoTrack])

    useEffect(() => {
        if (localAudioTrack) {
            Object.values(peerConnections).forEach((peerConnection) =>
                peerConnection.setAudioTrack(localAudioTrack)
            )
        }
    }, [peerConnections, localAudioTrack])

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

    return <WebRTCContext.Provider value={value}>{children}</WebRTCContext.Provider>
}
export type { WebRTCContextT }
export { WebRTCContext }
export default WebRTCProvider

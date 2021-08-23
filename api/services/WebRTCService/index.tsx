import React, { useEffect, useState } from 'react'
import {
    addRemoteWebRTCAudioTrack,
    addRemoteWebRTCVideoTrack,
    logger,
    setLocalWebRTCAudioTracks,
    setLocalWebRTCVideoTracks,
    useStageSelector,
} from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import { shallowEqual, useDispatch } from 'react-redux'
import WebRTCConnection from './WebRTCConnection'
import getVideoTracks from '../../utils/getVideoTracks'
import getAudioTracks from '../../utils/getAudioTracks'
import omit from 'lodash/omit'
import { ITeckosClient } from 'teckos-client'

const WebRTCService = () => {
    const connection = useStageSelector<ITeckosClient>((state) => state.globals.connection)
    const emit = connection ? connection.emit : undefined
    const [ready, setReady] = useState<boolean>(false)
    const dispatch = useDispatch()
    const [localVideoTrack, setLocalVideoTrack] = useState<MediaStreamTrack>()
    const [localAudioTrack, setLocalAudioTrack] = useState<MediaStreamTrack>()
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
        if (connection && dispatch && localStageDeviceId && stageId) {
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
                                    dispatch(addRemoteWebRTCVideoTrack(track))
                                } else {
                                    logger.trace('Got new remote audio from ' + stageId)
                                    dispatch(addRemoteWebRTCAudioTrack(track))
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
    }, [dispatch, connection, localStageDeviceId, stageId])

    useEffect(() => {
        if (ready && emit && dispatch && localStageDeviceId) {
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
                                    dispatch(addRemoteWebRTCVideoTrack(track))
                                } else {
                                    logger.trace('Got new remote audio from ' + stageId)
                                    dispatch(addRemoteWebRTCAudioTrack(track))
                                }
                            }
                        )
                        cleanedUp[stageDeviceId].connect()
                    }
                })
                return cleanedUp
            })
        }
    }, [dispatch, emit, localStageDeviceId, ready, stageDeviceIds, stageId])

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
            logger.trace('Fetching video tracks')
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
                                    logger.error(
                                        'Could not publish local video track. Reason: ' + error
                                    )
                                } else {
                                    logger.trace('Published local video track')
                                    publishedId = videoTrack._id
                                }
                            }
                        )
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
                                logger.error(
                                    'Could not UNpublish local video track. Reason: ' + error
                                )
                            } else {
                                logger.trace('UNpublished local video track')
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
                                    logger.error(
                                        'Could not publish local audio track. Reason: ' + error
                                    )
                                } else {
                                    logger.trace('Published local audio track')
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
                                logger.error(
                                    'Could not UNpublish local audio track. Reason: ' + error
                                )
                            } else {
                                logger.trace('UNpublished local audio track')
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
            dispatch(setLocalWebRTCVideoTracks({ [localStageDeviceId]: localVideoTrack }))
        } else {
            dispatch(setLocalWebRTCVideoTracks({}))
        }
    }, [localVideoTrack, dispatch, localStageDeviceId])

    useEffect(() => {
        if (localAudioTrack) {
            dispatch(setLocalWebRTCAudioTracks({ [localStageDeviceId]: localAudioTrack }))
        } else {
            dispatch(setLocalWebRTCAudioTracks({}))
        }
    }, [localAudioTrack, dispatch, localStageDeviceId])

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

    return null
}
export default WebRTCService

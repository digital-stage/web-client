import React from 'react'
import { useEmit, useNotification, useStageSelector } from '@digitalstage/api-client-react'
import { config } from './config'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { logger } from '../../logger'
import { Broker, DescriptionListener, IceCandidateListener } from './Broker'
import { useWebRTCLocalAudioTrack, useWebRTCLocalVideoTrack } from './index'

const { trace, reportError } = logger('WebRTCService:PeerConnection')

const PeerConnection = ({
    stageDeviceId,
    onRemoteTrack,
    onStats,
    broker,
}: {
    stageDeviceId: string
    onRemoteTrack: (stageDeviceId: string, track: MediaStreamTrack) => void
    onStats: (trackId: string, stats: RTCStatsReport) => void
    broker: Broker
}): JSX.Element => {
    const [ready, setReady] = React.useState<boolean>(false)
    const notify = useNotification()
    const [peerConnection, setPeerConnection] = React.useState<RTCPeerConnection>()
    const makingOffer = React.useRef<boolean>(false)
    const ignoreOffer = React.useRef<boolean>(false)
    const videoSender = React.useRef<RTCRtpSender>(undefined)
    const audioSender = React.useRef<RTCRtpSender>(undefined)
    const localStageDeviceId = useStageSelector((state) => state.globals.localStageDeviceId)
    const emit = useEmit()
    const isPolite = React.useMemo(
        () => localStageDeviceId.localeCompare(stageDeviceId) > 0,
        [localStageDeviceId, stageDeviceId]
    )
    const [receivedTracks, setReceivedTracks] = React.useState<MediaStreamTrack[]>([])

    React.useEffect(() => {
        trace('Created new peer connection ' + stageDeviceId)
        const connection = new RTCPeerConnection(config)
        setPeerConnection(connection)
        return () => {
            trace('Closing peer connection ' + stageDeviceId)
            connection.close()
        }
    }, [stageDeviceId])

    React.useEffect(() => {
        if (
            stageDeviceId &&
            emit &&
            localStageDeviceId &&
            onRemoteTrack &&
            peerConnection &&
            notify
        ) {
            trace(`Attaching handlers to peer connection ${stageDeviceId}`)
            peerConnection.oniceconnectionstatechange = () => {
                trace(
                    `with ${stageDeviceId}: iceConnectionState`,
                    peerConnection.iceConnectionState
                )
                if (peerConnection.iceConnectionState == 'failed') peerConnection.restartIce()
            }
            peerConnection.onnegotiationneeded = async () => {
                try {
                    trace(`to ${stageDeviceId}: Making offer`, isPolite ? 'polite' : 'rude')
                    makingOffer.current = true
                    await peerConnection.setLocalDescription()
                    trace(`to ${stageDeviceId}: Sending offer to ${stageDeviceId}`)
                    return emit(ClientDeviceEvents.SendP2POffer, {
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        offer: peerConnection.localDescription,
                    } as ClientDevicePayloads.SendP2POffer)
                } catch (err) {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                } finally {
                    makingOffer.current = false
                }
            }
            peerConnection.onicecandidateerror = (err) => {
                notify({
                    kind: 'error',
                    message: err,
                })
                console.error(err)
            }
            peerConnection.ontrack = (ev) => {
                if (
                    (!videoSender.current || ev.track.id !== videoSender.current.track?.id) &&
                    (!audioSender.current || ev.track.id !== audioSender.current.track?.id)
                ) {
                    onRemoteTrack(stageDeviceId, ev.track)
                    setReceivedTracks((prev) => [...prev, ev.track])
                    const onEnded = () =>
                        setReceivedTracks((prev) => prev.filter((t) => t.id !== ev.track.id))
                    ev.track.addEventListener('mute', onEnded)
                    ev.track.addEventListener('ended', onEnded)
                }
            }
            peerConnection.onicecandidate = (ev) =>
                emit(ClientDeviceEvents.SendIceCandidate, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    iceCandidate: ev.candidate,
                } as ClientDevicePayloads.SendIceCandidate)

            peerConnection.onconnectionstatechange = () => {
                trace(`with ${stageDeviceId}: connectionState`, peerConnection.connectionState)
            }
            peerConnection.onsignalingstatechange = () => {
                trace(`with ${stageDeviceId}: signalingState`, peerConnection.signalingState)
            }
            setReady(true)
        }
    }, [
        emit,
        isPolite,
        localStageDeviceId,
        stageDeviceId,
        onRemoteTrack,
        notify,
        setReceivedTracks,
        peerConnection,
    ])

    const handleDescription = React.useCallback(
        async (description: RTCSessionDescriptionInit) => {
            if (description.type == 'offer') {
                // Detect collision
                ignoreOffer.current = !isPolite && makingOffer.current
                if (ignoreOffer.current) {
                    trace(
                        `from ${stageDeviceId}: Ignoring offer`,
                        makingOffer.current,
                        isPolite ? 'polite' : 'rude',
                        peerConnection.signalingState
                    )
                    return
                }
                trace(
                    `from ${stageDeviceId}: Accepting offer`,
                    makingOffer,
                    isPolite ? 'polite' : 'rude',
                    peerConnection.signalingState
                )
                await peerConnection.setRemoteDescription(description)
                await peerConnection.setLocalDescription()
                trace(
                    `to ${stageDeviceId}: Answering offer`,
                    makingOffer.current,
                    isPolite ? 'polite' : 'rude',
                    peerConnection.signalingState
                )
                emit(ClientDeviceEvents.SendP2PAnswer, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    answer: peerConnection.localDescription,
                } as ClientDevicePayloads.SendP2PAnswer)
            } else if (peerConnection.signalingState === 'have-local-offer') {
                trace(
                    `from ${stageDeviceId}: Accepting answer`,
                    makingOffer.current,
                    isPolite ? 'polite' : 'rude',
                    peerConnection.signalingState
                )
                await peerConnection.setRemoteDescription(description)
            } else {
                reportError('Got answer, but made no offer')
            }
        },
        [emit, isPolite, localStageDeviceId, peerConnection, stageDeviceId]
    )

    const handleCandidate = React.useCallback(
        (candidate: RTCIceCandidate | null) => {
            if (candidate === null) {
                console.log('We have an null candidate')
            }
            return peerConnection.addIceCandidate(candidate).catch((err) => {
                if (!ignoreOffer.current) {
                    throw err
                }
            })
        },
        [peerConnection]
    )

    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const id = setInterval(() => {
                if (peerConnection) {
                    receivedTracks.map((track) =>
                        peerConnection.getStats(track).then((stats) => onStats(track.id, stats))
                    )
                }
            }, 5000)
            return () => {
                clearInterval(id)
            }
        }
    }, [onStats, peerConnection, receivedTracks])

    React.useEffect(() => {
        if (stageDeviceId && notify && ready) {
            const descriptionListener: DescriptionListener = (description) =>
                handleDescription(description).catch((err) => {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                })
            broker.addDescriptionListener(stageDeviceId, descriptionListener)
            return () => {
                broker.removeDescriptionListener(stageDeviceId, descriptionListener)
            }
        }
    }, [broker, handleDescription, notify, ready, stageDeviceId])

    React.useEffect(() => {
        if (stageDeviceId && notify && ready) {
            const iceCandidateListener: IceCandidateListener = (description) =>
                handleCandidate(description).catch((err) => {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                })
            broker.addIceCandidateListener(stageDeviceId, iceCandidateListener)
            return () => {
                broker.removeIceCandidateListener(stageDeviceId, iceCandidateListener)
            }
        }
    }, [broker, handleCandidate, handleDescription, notify, ready, stageDeviceId])

    const videoTrack = useWebRTCLocalVideoTrack()
    React.useEffect(() => {
        if (peerConnection) {
            if (videoTrack) {
                if (!videoSender.current || videoSender.current.track.id !== videoTrack.id) {
                    if (videoSender.current) {
                        peerConnection.removeTrack(videoSender.current)
                    }
                    videoSender.current = peerConnection.addTrack(videoTrack)
                }
            } else if (videoSender.current) {
                peerConnection.removeTrack(videoSender.current)
            }
        }
    }, [peerConnection, videoTrack])

    const audioTrack = useWebRTCLocalAudioTrack()
    React.useEffect(() => {
        if (peerConnection) {
            if (audioTrack) {
                if (!audioSender.current || audioSender.current.track.id !== audioTrack.id) {
                    if (audioSender.current) {
                        peerConnection.removeTrack(audioSender.current)
                    }
                    audioSender.current = peerConnection.addTrack(audioTrack)
                }
            } else if (audioSender.current) {
                peerConnection.removeTrack(audioSender.current)
            }
        }
    }, [peerConnection, audioTrack])

    return null
}
const MemoizedPeerConnection = React.memo(PeerConnection)
export { MemoizedPeerConnection as PeerConnection }

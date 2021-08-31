import React from 'react'
import { useEmit, useNotification, useStageSelector } from '@digitalstage/api-client-react'
import { config } from './config'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { logger } from '../../logger'

const { trace, warn, reportError } = logger('WebRTCService:PeerConnection')

const PeerConnection = ({
    stageDeviceId,
    onRemoteTrack,
    onStats,
    tracks,
    currentDescription,
    currentCandidate,
}: {
    stageDeviceId: string
    onRemoteTrack: (stageDeviceId: string, track: MediaStreamTrack) => void
    onStats: (trackId: string, stats: RTCStatsReport) => void
    tracks: MediaStreamTrack[]
    currentDescription?: RTCSessionDescriptionInit
    currentCandidate?: RTCIceCandidate | null
}): JSX.Element => {
    const notify = useNotification()
    //const [ready, setReady] = React.useState<boolean>(false)
    const ready = React.useRef<boolean>(false)
    const connection = React.useRef<RTCPeerConnection>(new RTCPeerConnection(config))
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
        if (
            stageDeviceId &&
            emit &&
            localStageDeviceId &&
            onRemoteTrack &&
            connection.current &&
            notify
        ) {
            trace('Attaching handlers to peer connection')
            const peerConnection = connection.current
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
            ready.current = true
            // Make offer by sending dummy tracks
            //peerConnection.addTransceiver("video")
            //peerConnection.addTransceiver("audio")
        }
    }, [
        emit,
        isPolite,
        localStageDeviceId,
        stageDeviceId,
        onRemoteTrack,
        notify,
        setReceivedTracks,
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
                        connection.current.signalingState
                    )
                    return
                }
                trace(
                    `from ${stageDeviceId}: Accepting offer`,
                    makingOffer,
                    isPolite ? 'polite' : 'rude',
                    connection.current.signalingState
                )
                await connection.current.setRemoteDescription(description)
                await connection.current.setLocalDescription()
                trace(
                    `to ${stageDeviceId}: Answering offer`,
                    makingOffer.current,
                    isPolite ? 'polite' : 'rude',
                    connection.current.signalingState
                )
                emit(ClientDeviceEvents.SendP2PAnswer, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    answer: connection.current.localDescription,
                } as ClientDevicePayloads.SendP2PAnswer)
            } else if (connection.current.signalingState === 'have-local-offer') {
                trace(
                    `from ${stageDeviceId}: Accepting answer`,
                    makingOffer.current,
                    isPolite ? 'polite' : 'rude',
                    connection.current.signalingState
                )
                await connection.current.setRemoteDescription(description)
            } else {
                reportError("Got answer, but made no offer")
            }
        },
        [emit, isPolite, localStageDeviceId, stageDeviceId]
    )

    const handleCandidate = React.useCallback((candidate: RTCIceCandidate | null) => {
        if (candidate === null) {
            console.log('We have an null candidate')
        }
        return connection.current.addIceCandidate(candidate).catch((err) => {
            if (!ignoreOffer.current) {
                throw err
            }
        })
    }, [])

    React.useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            const id = setInterval(() => {
                if (connection.current) {
                    receivedTracks.map((track) =>
                        connection.current.getStats(track).then((stats) => onStats(track.id, stats))
                    )
                }
            }, 5000)
            return () => {
                clearInterval(id)
            }
        }
    }, [onStats, receivedTracks])

    React.useEffect(() => {
        if (ready.current) {
            if(currentDescription && notify) {
                handleDescription(currentDescription).catch((err) => {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                })
            }
        } else {
            warn("Got description too early")
        }
    }, [currentDescription, handleDescription, notify])

    React.useEffect(() => {
        if(ready.current) {
            if (currentCandidate && notify) {
                handleCandidate(currentCandidate).catch((err) => {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                })
            }
        } else {
            warn("Got ICE candidate too early")
        }
    }, [currentCandidate, handleCandidate, notify])

    React.useEffect(() => {
        const senders = connection.current.getSenders()
        senders.map((sender) => {
            if (sender.track && !tracks.find((track) => track.id === sender.track.id)) {
                connection.current.removeTrack(sender)
            }
        })
        tracks.map((track) => {
            if (!senders.find((sender) => sender.track && sender.track?.id === track.id)) {
                trace('ADDING LOCAL TRACK ' + track.id)
                const sender = connection.current.addTrack(track)
                const endTrack = () => connection.current.removeTrack(sender)
                track.onmute = endTrack
                track.onended = endTrack
            }
        })
    }, [tracks])

    return null
}
const MemoizedPeerConnection = React.memo(PeerConnection)
export { MemoizedPeerConnection as PeerConnection }

import React from 'react'
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { config } from './config'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import debug from 'debug'

const report = debug('WebRTCService').extend('PeerConnection')
const reportTrace = report.extend('trace')
const reportError = report.extend('error')

const PeerConnection = ({
    stageDeviceId,
    onRemoteTrack,
    tracks,
    currentDescription,
    currentCandidate,
}: {
    stageDeviceId: string
    onRemoteTrack: (stageDeviceId: string, track: MediaStreamTrack) => void
    tracks: MediaStreamTrack[]
    currentDescription?: RTCSessionDescriptionInit
    currentCandidate?: RTCIceCandidate | null
}): JSX.Element => {
    report('RENDER')
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

    React.useEffect(() => {
        if (stageDeviceId && emit && localStageDeviceId && onRemoteTrack && connection.current) {
            reportTrace('Attaching handlers to peer connection')
            const peerConnection = connection.current
            peerConnection.oniceconnectionstatechange = () => {
                reportTrace(
                    `with ${stageDeviceId}: iceConnectionState`,
                    peerConnection.iceConnectionState
                )
                if (peerConnection.connectionState == 'failed') peerConnection.restartIce()
            }
            peerConnection.onnegotiationneeded = async () => {
                try {
                    reportTrace(`to ${stageDeviceId}: Making offer`, isPolite ? 'polite' : 'rude')
                    makingOffer.current = true
                    await peerConnection.setLocalDescription()
                    reportTrace(`to ${stageDeviceId}: Sending offer to ${stageDeviceId}`)
                    return emit(ClientDeviceEvents.SendP2POffer, {
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        offer: peerConnection.localDescription,
                    } as ClientDevicePayloads.SendP2POffer)
                } catch (err) {
                    reportError(err)
                } finally {
                    makingOffer.current = false
                }
            }
            peerConnection.onicecandidateerror = (e) => {
                reportError(e)
            }
            peerConnection.ontrack = (ev) => {
                if (
                    (!videoSender.current || ev.track.id !== videoSender.current.track?.id) &&
                    (!audioSender.current || ev.track.id !== audioSender.current.track?.id)
                ) {
                    onRemoteTrack(stageDeviceId, ev.track)
                }
            }
            peerConnection.onicecandidate = (ev) =>
                emit(ClientDeviceEvents.SendIceCandidate, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    iceCandidate: ev.candidate,
                } as ClientDevicePayloads.SendIceCandidate)

            peerConnection.onconnectionstatechange = () => {
                reportTrace(
                    `with ${stageDeviceId}: connectionState`,
                    peerConnection.connectionState
                )
            }
            peerConnection.onsignalingstatechange = () => {
                reportTrace(`with ${stageDeviceId}: signalingState`, peerConnection.signalingState)
            }
        }
    }, [emit, isPolite, localStageDeviceId, stageDeviceId, onRemoteTrack])

    const handleDescription = React.useCallback(
        async (description: RTCSessionDescriptionInit) => {
            if (description.type == 'offer') {
                // Detect collision
                ignoreOffer.current = !isPolite && makingOffer.current
                if (ignoreOffer.current) {
                    reportTrace(
                        `from ${stageDeviceId}: Ignoring offer`,
                        makingOffer.current,
                        isPolite ? 'polite' : 'rude',
                        connection.current.signalingState
                    )
                    return
                }
                reportTrace(
                    `from ${stageDeviceId}: Accepting offer`,
                    makingOffer,
                    isPolite ? 'polite' : 'rude',
                    connection.current.signalingState
                )
                await connection.current.setRemoteDescription(description)
                await connection.current.setLocalDescription()
                reportTrace(
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
                reportTrace(
                    `from ${stageDeviceId}: Accepting answer`,
                    makingOffer.current,
                    isPolite ? 'polite' : 'rude',
                    connection.current.signalingState
                )
                await connection.current.setRemoteDescription(description)
            }
        },
        [emit, isPolite, localStageDeviceId, stageDeviceId]
    )

    const handleCandidate = React.useCallback(
        (candidate: RTCIceCandidate | null) =>
            connection.current.addIceCandidate(candidate).catch((err) => {
                if (!ignoreOffer.current) {
                    throw err
                }
            }),
        []
    )

    React.useEffect(() => {
        if (currentDescription) {
            handleDescription(currentDescription).catch((err) => reportError(err))
        }
    }, [currentDescription, handleDescription])

    React.useEffect(() => {
        if (currentCandidate) {
            handleCandidate(currentCandidate).catch((err) => reportError(err))
        }
    }, [currentCandidate, handleCandidate])

    React.useEffect(() => {
        const senders = connection.current.getSenders()
        senders.map((sender) => {
            if (sender.track && !tracks.find((track) => track.id === sender.track.id)) {
                connection.current.removeTrack(sender)
            }
        })
        tracks.map((track) => {
            if (!senders.find((sender) => sender.track && sender.track?.id === track.id)) {
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

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
}: {
    stageDeviceId: string
    onRemoteTrack: (track: MediaStreamTrack) => void
    tracks: MediaStreamTrack[]
}) => {
    const connection = React.useRef<RTCPeerConnection>(undefined)
    const makingOffer = React.useRef<boolean>(false)
    const videoSender = React.useRef<RTCRtpSender>(undefined)
    const audioSender = React.useRef<RTCRtpSender>(undefined)
    const localStageDeviceId = useStageSelector((state) => state.globals.localStageDeviceId)
    const emit = useEmit()
    const isPolite = React.useMemo(
        () => localStageDeviceId.localeCompare(stageDeviceId) > 0,
        [localStageDeviceId, stageDeviceId]
    )

    React.useEffect(() => {
        if (stageDeviceId && emit) {
            const peerConnection = new RTCPeerConnection(config)
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
                )
                    onRemoteTrack(ev.track)
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
            connection.current = peerConnection
        }
    }, [emit, isPolite, localStageDeviceId, stageDeviceId, onRemoteTrack])

    React.useEffect(() => {
        const senders = connection.current.getSenders()
        tracks.map((track) => {
            if (!senders.find((sender) => sender.track?.id === track.id)) {
                const sender = connection.current.addTrack(track)
                track.onended = () => {
                    connection.current.removeTrack(sender)
                }
            }
        })
    }, [tracks])

    return null
}
export { PeerConnection }

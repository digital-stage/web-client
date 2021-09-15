import React from 'react'
import {useEmit, useNotification, useStageSelector} from '@digitalstage/api-client-react'
import {config} from './config'
import {logger} from '../../logger'
import {Broker} from './Broker'
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {PeerNegotiation} from "./PeerNegotiation";
import {useWebRTCLocalAudioTrack, useWebRTCLocalVideo} from './index'

const {trace} = logger('WebRTCService:PeerConnection')

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
    const ready = useStageSelector(state => state.globals.ready)
    const notify = useNotification()
    const emit = useEmit()
    const localStageDeviceId = useStageSelector((state) => state.globals.localStageDeviceId)
    const [receivedTracks, setReceivedTracks] = React.useState<MediaStreamTrack[]>([])
    const turnServers = useStageSelector(state => state.globals.turn?.urls || [])
    const turnUsername = useStageSelector(state => state.globals.turn?.username)
    const turnCredential = useStageSelector(state => state.globals.turn?.credential)
    const [connection, setConnection] = React.useState<PeerNegotiation>()

    React.useEffect(() => {
        if (ready && notify && emit && localStageDeviceId && stageDeviceId && onRemoteTrack && broker && onStats) {
            trace('Created new peer connection ' + stageDeviceId)
            trace(turnServers.length > 0 ? 'Using TURN servers' : 'Fallback to public STUN servers')

            const onDescription = (description: RTCSessionDescriptionInit) => {
                trace("Sending " + description.type)
                if (description.type === "offer") {
                    emit(ClientDeviceEvents.SendP2POffer, {
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        offer: description,
                    } as ClientDevicePayloads.SendP2POffer)
                } else if (description.type === "answer") {
                    emit(ClientDeviceEvents.SendP2PAnswer, {
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        answer: description,
                    } as ClientDevicePayloads.SendP2PAnswer)
                }
            }
            const onCandidate = (iceCandidate: RTCIceCandidate) => {
                trace("Sending candidate")
                emit(ClientDeviceEvents.SendIceCandidate, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    iceCandidate: iceCandidate,
                } as ClientDevicePayloads.SendIceCandidate)
            }
            const onRestart = () => {
                trace("Sending restart request")
                emit(ClientDeviceEvents.SendP2PRestart, {
                    from: localStageDeviceId,
                    to: stageDeviceId,
                } as ClientDevicePayloads.SendP2PRestart)
            }
            const onTrack = (track: MediaStreamTrack, stats?: RTCStatsReport) => {
                trace("Got new remote track")
                onRemoteTrack(stageDeviceId, track)
                setReceivedTracks((prev) => [...prev, track])
                if (stats) {
                    onStats(track.id, stats)
                }
                const onEnded = () =>
                    setReceivedTracks((prev) => prev.filter((t) => t.id !== track.id))
                track.addEventListener('mute', onEnded)
                track.addEventListener('ended', onEnded)
            }
            const polite: boolean = localStageDeviceId.localeCompare(stageDeviceId) > 0

            const configuration = turnServers.length > 0 ? {
                ...config,
                iceServers: [
                    {urls: turnServers.map(url => `stun:${url}`)},
                    {
                        urls: turnServers.map(url => `turn:${url}`),
                        username: turnUsername,
                        credential: turnCredential
                    }
                ],
                sdpSemantics: 'unified-plan'
            } : config
            const peerConnection = new PeerNegotiation({
                remoteId: stageDeviceId,
                configuration,
                onTrack,
                onDescription,
                onCandidate,
                onRestart,
                polite
            })
            const handleRestart = () => {
                peerConnection.restart()
                peerConnection.createOffer()
                    .catch(err => notify({
                        kind: 'error',
                        message: err,
                    }))
            }
            const handleDescription = description => {
                trace("Forwarding remote " + description.type)
                peerConnection.setDescription(description)
            }
            const handleCandidate = candidate => {
                trace("Forwarding remote candidate")
                peerConnection.addCandidate(candidate)
            }
            broker.addRestartListener(stageDeviceId, handleRestart)
            broker.addDescriptionListener(stageDeviceId, handleDescription)
            broker.addIceCandidateListener(stageDeviceId, handleCandidate)
            setConnection(peerConnection)
            return () => {
                trace('Closing peer connection ' + stageDeviceId)
                broker.removeRestartListener(stageDeviceId, handleRestart)
                broker.removeDescriptionListener(stageDeviceId, handleDescription)
                broker.removeIceCandidateListener(stageDeviceId, handleCandidate)
                peerConnection.stop()
                setConnection(undefined)
            }
        }
    }, [stageDeviceId, turnServers, turnUsername, turnCredential, localStageDeviceId, emit, onRemoteTrack, onStats, broker, notify, ready])

    React.useEffect(() => {
        if (process.env.NODE_ENV !== 'production') {
            const id = setInterval(() => {
                if (connection) {
                    receivedTracks.map((track) =>
                        connection.getStats(track).then((stats) => onStats(track.id, stats))
                    )
                }
            }, 5000)
            return () => {
                clearInterval(id)
            }
        }
    }, [connection, onStats, receivedTracks])

    const videoTrack = useWebRTCLocalVideo()
    React.useEffect(() => {
        if (connection) {
            trace("videoTrack effect")
            connection.setVideoTrack(videoTrack)
        }
    }, [connection, videoTrack])

    const audioTrack = useWebRTCLocalAudioTrack()
    React.useEffect(() => {
        if (connection) {
            connection.setAudioTrack(audioTrack)
        }
    }, [connection, audioTrack])

    return null
}
const MemoizedPeerConnection = React.memo(PeerConnection)
export {MemoizedPeerConnection as PeerConnection}

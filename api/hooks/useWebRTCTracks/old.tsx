import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useConnection, useReport, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import debug from 'debug'
import { shallowEqual } from 'react-redux'
import getVideoTracks from '../../services/utils/getVideoTracks'
import getAudioTracks from '../../services/utils/getAudioTracks'
import adapter from 'webrtc-adapter'

const log = debug('useWebRTCTracks')
const warn = log.extend('warn')

log(
    'Using ' +
        adapter.browserDetails.browser +
        ' with WebRTC version ' +
        adapter.browserDetails.version
)

const config = {
    iceServers: [
        {
            urls: 'turn:18.185.72.86:3478?transport=tcp',
            credential: '2021',
            username: 'digitalstage',
        },
        {
            urls: [
                'stun:stun.l.google.com:19302',
                'stun:stun1.l.google.com:19302',
                'stun:stun2.l.google.com:19302',
                'stun:stun3.l.google.com:19302',
                'stun:stun4.l.google.com:19302',
            ],
        },
    ],
}
type TrackList = {
    [trackId: string]: MediaStreamTrack
}
type DescriptionList = {
    [from: string]: RTCSessionDescriptionInit
}
type CandidatesList = {
    [from: string]: RTCIceCandidate
}

interface WebRTCContext {
    localVideoTracks: TrackList
    localAudioTracks: TrackList
    remoteVideoTracks: TrackList
    remoteAudioTracks: TrackList
}

const Context = createContext<WebRTCContext>({
    localAudioTracks: {},
    localVideoTracks: {},
    remoteAudioTracks: {},
    remoteVideoTracks: {},
})
const useWebRTCTracks = () => useContext<WebRTCContext>(Context)

const StageDeviceConnection = ({
    localStageDeviceId,
    stageDeviceId,
    description,
    candidate,
    setRemoteVideoTracks,
    setRemoteAudioTracks,
    resetDescription,
    resetCandidate,
}: {
    // Local specification
    localStageDeviceId: string
    // Connection details
    stageDeviceId: string
    description?: RTCSessionDescriptionInit
    candidate?: RTCIceCandidate | null
    // Resulting remote tracks
    setRemoteVideoTracks: React.Dispatch<React.SetStateAction<TrackList>>
    setRemoteAudioTracks: React.Dispatch<React.SetStateAction<TrackList>>
    resetDescription: () => void
    resetCandidate: () => void
}) => {
    const { emit } = useConnection()
    const [makingOffer, setMakingOffer] = useState<boolean>(false)
    const [ignoreOffer, setIgnoreOffer] = useState<boolean>(false)
    const [connection, setConnection] = useState<RTCPeerConnection>()
    const [, setSignalingState] = useState<RTCSignalingState>('closed')
    const { localVideoTracks, localAudioTracks } = useWebRTCTracks()
    const [, setAudioDummy] = useState<RTCRtpSender>()

    useEffect(() => {
        if (connection && resetCandidate && candidate !== undefined) {
            if (!ignoreOffer) {
                connection.addIceCandidate(candidate).catch((err) => {
                    warn(err, candidate)
                })
                resetCandidate()
            } else {
                log('Safely ignoring ICE candidate')
            }
        }
    }, [connection, candidate, ignoreOffer, resetCandidate])

    useEffect(() => {
        // Connect
        if (
            emit &&
            localStageDeviceId &&
            stageDeviceId &&
            setRemoteAudioTracks &&
            setRemoteVideoTracks
        ) {
            log('Creating connection to ' + stageDeviceId)
            const conn = new RTCPeerConnection(config)
            conn.ontrack = (ev) => {
                log(
                    'Got new ' + ev.track.kind + ' track from connection ' + stageDeviceId,
                    ev.track
                )
                ev.track.onmute = () => log(ev.track.kind + ' TRACK IS MUTED')
                ev.track.onunmute = () => log(ev.track.kind + ' TRACK IS UNMUTED')
                if (ev.track.kind === 'video') {
                    setRemoteVideoTracks((prev) => ({
                        ...prev,
                        [stageDeviceId]: ev.track,
                    }))
                } else {
                    setRemoteAudioTracks((prev) => ({
                        ...prev,
                        [stageDeviceId]: ev.track,
                    }))
                }
            }
            conn.onicecandidate = (ev) =>
                emit(ClientDeviceEvents.SendIceCandidate, {
                    to: stageDeviceId,
                    from: localStageDeviceId,
                    iceCandidate: ev.candidate,
                } as ClientDevicePayloads.SendIceCandidate)
            conn.onicecandidateerror = (ev) => warn(ev.errorText)
            conn.oniceconnectionstatechange = () => {
                switch (conn.iceConnectionState) {
                    case 'failed': {
                        log('ICE: Failed, restarting ICE connection to ' + stageDeviceId)
                        conn.restartIce()
                        break
                    }
                    case 'closed': {
                        log('ICE: Closed connection to ' + stageDeviceId)
                        break
                    }
                    case 'checking': {
                        log('ICE: Checking connection to ' + stageDeviceId)
                        break
                    }
                    case 'completed': {
                        log('ICE: Completed connection to ' + stageDeviceId)
                        break
                    }
                    case 'connected': {
                        log('ICE: Connected to ' + stageDeviceId)
                        break
                    }
                    case 'disconnected': {
                        log('ICE: Disconnected from ' + stageDeviceId)
                        break
                    }
                    case 'new': {
                        log('ICE: New connection attempt to ' + stageDeviceId)
                        break
                    }
                }
            }
            conn.onconnectionstatechange = (ev) => {
                switch (conn.connectionState) {
                    case 'connected':
                        log('Fully connected to ' + stageDeviceId)
                        break
                    case 'disconnected':
                        log('Disconnected from ' + stageDeviceId)
                        //conn.restartIce()
                        break
                    case 'failed':
                        // One or more transports has terminated unexpectedly or in an error
                        log('Failed to connect to ' + stageDeviceId)
                        break
                    case 'closed':
                        log('Closed connection to ' + stageDeviceId)
                        // The connection has been closed
                        break
                }
            }
            conn.onsignalingstatechange = () => {
                log('Signaling state = ' + conn.signalingState)
                setSignalingState(conn.signalingState)
            }

            conn.onnegotiationneeded = (ev) => {
                log('Making offer to stage device ' + stageDeviceId)
                setMakingOffer(true)
                return conn
                    .setLocalDescription()
                    .then(() =>
                        emit(
                            ClientDeviceEvents.SendP2POffer,
                            {
                                from: localStageDeviceId,
                                to: stageDeviceId,
                                offer: conn.localDescription,
                            } as ClientDevicePayloads.SendP2POffer,
                            () => {
                                log('Made offer to stage device ' + stageDeviceId)
                            }
                        )
                    )
                    .catch((err) => {
                        console.error(err)
                    })
            }
            setConnection(conn)
            return () => {
                log('Cleaning up connection')
                conn.getTransceivers().map((t) => t.stop())
                conn.close()
                setConnection(undefined)
            }
        }
    }, [emit, localStageDeviceId, setRemoteAudioTracks, setRemoteVideoTracks, stageDeviceId])

    useEffect(() => {
        if (connection && emit && stageDeviceId && localStageDeviceId) {
            const polite = stageDeviceId.localeCompare(localStageDeviceId) >= 0
            if (!polite) {
                log('Initiating the connection')
                connection
                    .setLocalDescription()
                    .then(() =>
                        emit(
                            ClientDeviceEvents.SendP2POffer,
                            {
                                from: localStageDeviceId,
                                to: stageDeviceId,
                                offer: connection.localDescription,
                            } as ClientDevicePayloads.SendP2POffer,
                            () => {
                                log('Made offer to stage device ' + stageDeviceId)
                            }
                        )
                    )
                    .catch((err) => {
                        console.error(err)
                    })
            }
        }
    }, [connection, emit, localStageDeviceId, stageDeviceId])

    useEffect(() => {
        if (connection) {
            let senders = []
            const tracks = Object.values(localVideoTracks)
            if (tracks.length > 0) {
                log('Sending ' + tracks.length + ' video tracks')
                senders = Object.values(localVideoTracks).map((track) => {
                    log('Adding video track to connection')
                    return connection.addTrack(track)
                })
            } /*else {
                log('Warming up video connection using dummy')
                senders = [connection.addTransceiver('video').sender]
            }*/
            return () => {
                if (connection && connection.connectionState != 'closed')
                    senders.map((sender) => connection.removeTrack(sender))
            }
        }
    }, [connection, localVideoTracks])

    useEffect(() => {
        if (connection) {
            log('REPLACING AUDIO TRACKS')
            /*setAudioDummy((prev) => {
                if (prev) connection.removeTrack(prev)
                return undefined
            })*/
            const senders = Object.values(localAudioTracks).map((track) => {
                log('Adding audio track to connection')
                return connection.addTrack(track)
            })
            return () => {
                if (connection && connection.connectionState != 'closed')
                    senders.map((sender) => connection.removeTrack(sender))
            }
        }
    }, [connection, localAudioTracks])

    useEffect(() => {
        if (connection && emit && description && resetDescription) {
            log('Got ' + description.type + ' from ' + stageDeviceId)
            if (description.type == 'answer') log(description)
            // Use latest description
            const offerCollision =
                description.type == 'offer' &&
                (makingOffer || connection.signalingState != 'stable')
            const invalidAnswer = description.type == 'answer' && !connection.localDescription
            const polite = stageDeviceId.localeCompare(localStageDeviceId) >= 0
            if (polite) log('Im polite')
            const ignoreOffer = !polite && offerCollision
            if (offerCollision) log('Detected offer collision')
            if (invalidAnswer) log('Detected invalid answer')
            setIgnoreOffer(ignoreOffer)
            if (!ignoreOffer) {
                connection
                    .setRemoteDescription(description)
                    .then(() => setMakingOffer(false))
                    .then(async () => {
                        if (description.type == 'offer') {
                            log('Answering to ' + stageDeviceId)
                            await connection.setLocalDescription()
                            emit(ClientDeviceEvents.SendP2PAnswer, {
                                from: localStageDeviceId,
                                to: stageDeviceId,
                                answer: connection.localDescription,
                            } as ClientDevicePayloads.SendP2PAnswer)
                        }
                    })
                    .catch((err) => log('ERROR 1: ' + err))
            } else {
                log('Ignoring ' + description.type)
            }
            resetDescription()
        }
    }, [
        connection,
        emit,
        description,
        resetDescription,
        makingOffer,
        stageDeviceId,
        localStageDeviceId,
    ])

    return null
}

/**
 *
 * Algorithm:
 *
 * If initializing, create a connection for each stage device that supports WebRTC
 * Create a peer connection and create an offer
 *
 * @param children
 * @constructor
 */
const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const { connection, emit } = useConnection()
    const { report } = useReport()
    const [ready, setReady] = useState<boolean>(false)
    const stageId = useStageSelector((state) => state.globals.stageId)
    const localDevice = useStageSelector<Device | undefined>(
        (state) =>
            state.globals.localDeviceId
                ? state.devices.byId[state.globals.localDeviceId]
                : undefined,
        shallowEqual
    )
    const localStageDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localStageDeviceId
    )
    const stageDeviceIds = useStageSelector<string[]>((state) =>
        localStageDeviceId
            ? state.stageDevices.byStage[stageId]?.filter(
                  (id) => id !== localStageDeviceId && state.stageDevices.byId[id].active
              ) || []
            : []
    )
    const [localVideoTracks, setLocalVideoTracks] = useState<TrackList>({})
    const [localAudioTracks, setLocalAudioTracks] = useState<TrackList>({})
    const [remoteVideoTracks, setRemoteVideoTracks] = useState<TrackList>({})
    const [remoteAudioTracks, setRemoteAudioTracks] = useState<TrackList>({})
    const [descriptions, setDescriptions] = useState<DescriptionList>({})
    const [candidates, setCandidates] = useState<CandidatesList>({})

    useEffect(() => {
        if (localStageDeviceId) log('This is stage device ' + localStageDeviceId)
    }, [localStageDeviceId])

    useEffect(() => {
        if (connection && report && emit) {
            const handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
                log('Received offer')
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: offer,
                }))
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                log('Received answer')
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: answer,
                }))
            }

            const handleIceCandidate = ({
                from,
                iceCandidate,
            }: ServerDevicePayloads.IceCandidateSent) =>
                setCandidates((prev) => ({
                    ...prev,
                    [from]: iceCandidate,
                }))
            connection.on(ServerDeviceEvents.P2POfferSent, handleOffer)
            connection.on(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
            connection.on(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
            setReady(true)
            return () => {
                setReady(false)
                connection.off(ServerDeviceEvents.P2POfferSent, handleOffer)
                connection.off(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
                connection.off(ServerDeviceEvents.IceCandidateSent, handleIceCandidate)
                setDescriptions({})
                setCandidates({})
            }
        }
    }, [connection, emit, report])

    useEffect(() => {
        if (emit && stageId && localDevice?.sendVideo && localDevice?.useP2P) {
            let abort = false
            let addedTracks = []
            let publishedTrackIds = []
            getVideoTracks(localDevice?.inputVideoDeviceId).then((tracks) => {
                if (abort) {
                    log('Abort and stopping all video tracks')
                    tracks.forEach((track) => track.stop())
                } else {
                    tracks.map((track) => {
                        if (!abort) {
                            const id = localStageDeviceId
                            addedTracks.push(track)
                            setLocalVideoTracks((prev) => ({
                                ...prev,
                                [id]: track,
                            }))
                            emit(
                                ClientDeviceEvents.CreateVideoTrack,
                                {
                                    stageId,
                                    trackId: id,
                                    type: 'browser',
                                } as ClientDevicePayloads.CreateVideoTrack,
                                (error, videoTrack) => {
                                    if (!error) publishedTrackIds.push(videoTrack._id)
                                }
                            )
                        }
                    })
                }
            })
            return () => {
                abort = true
                addedTracks.forEach((track) => track.stop())
                publishedTrackIds.forEach((id) =>
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        id as ClientDevicePayloads.RemoveVideoTrack
                    )
                )
                setLocalVideoTracks({})
            }
        }
    }, [
        emit,
        localStageDeviceId,
        localDevice?.inputVideoDeviceId,
        localDevice?.sendVideo,
        localDevice?.useP2P,
        stageId,
        localDevice?._id,
    ])

    useEffect(() => {
        if (emit && stageId && localDevice?.sendAudio && localDevice?.useP2P) {
            let abort = false
            let addedTracks = []
            let publishedTrackIds = []
            getAudioTracks({
                inputAudioDeviceId: localDevice.inputAudioDeviceId,
                autoGainControl: localDevice.autoGainControl,
                echoCancellation: localDevice.echoCancellation,
                noiseSuppression: localDevice.noiseSuppression,
                sampleRate: localDevice.sampleRate,
            }).then((tracks) => {
                if (abort) {
                    log('Abort and stopping all audio tracks')
                    tracks.forEach((track) => track.stop())
                } else {
                    tracks.map((track) => {
                        if (!abort) {
                            const id = localStageDeviceId
                            addedTracks.push(track)
                            setLocalAudioTracks((prev) => ({
                                ...prev,
                                [id]: track,
                            }))
                            emit(
                                ClientDeviceEvents.CreateAudioTrack,
                                {
                                    stageId,
                                    trackId: id,
                                    type: 'browser',
                                } as ClientDevicePayloads.CreateAudioTrack,
                                (error, audioTrack) => {
                                    if (!error) publishedTrackIds.push(audioTrack._id)
                                }
                            )
                        }
                    })
                }
            })
            return () => {
                abort = true
                addedTracks.forEach((track) => track.stop())
                publishedTrackIds.forEach((id) =>
                    emit(
                        ClientDeviceEvents.RemoveAudioTrack,
                        id as ClientDevicePayloads.RemoveAudioTrack
                    )
                )
                setLocalAudioTracks({})
            }
        }
    }, [
        emit,
        stageId,
        localDevice?._id,
        localDevice?.sendAudio,
        localDevice?.useP2P,
        localDevice?.inputVideoDeviceId,
        localDevice?.inputAudioDeviceId,
        localDevice?.autoGainControl,
        localDevice?.echoCancellation,
        localDevice?.noiseSuppression,
        localDevice?.sampleRate,
        localStageDeviceId,
    ])

    const value = useMemo(
        () => ({
            localVideoTracks,
            localAudioTracks,
            remoteVideoTracks,
            remoteAudioTracks,
        }),
        [localAudioTracks, localVideoTracks, remoteAudioTracks, remoteVideoTracks]
    )

    return (
        <Context.Provider value={value}>
            {ready &&
                stageDeviceIds.map((stageDeviceId) => (
                    <StageDeviceConnection
                        key={stageDeviceId}
                        localStageDeviceId={localStageDeviceId}
                        stageDeviceId={stageDeviceId}
                        description={descriptions[stageDeviceId]}
                        candidate={candidates[stageDeviceId]}
                        setRemoteVideoTracks={setRemoteVideoTracks}
                        setRemoteAudioTracks={setRemoteAudioTracks}
                        resetDescription={() =>
                            setDescriptions((prev) => ({
                                ...prev,
                                [stageDeviceId]: undefined,
                            }))
                        }
                        resetCandidate={() =>
                            setCandidates((prev) => ({
                                ...prev,
                                [stageDeviceId]: undefined,
                            }))
                        }
                    />
                ))}
            {children}
        </Context.Provider>
    )
}

export { WebRTCProvider }
export default useWebRTCTracks

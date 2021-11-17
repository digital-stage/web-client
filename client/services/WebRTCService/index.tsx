import React from "react";
import round from "lodash/round";
import {logger} from '../../logger'
import {useTrackedSelector} from 'client/redux/selectors/useTrackedSelector'
import {useConnection} from '../ConnectionService'
import {PeerConnection} from "./PeerConnection";
import {
    ClientDeviceEvents,
    ClientDevicePayloads, ClientLogEvents, ClientLogPayloads,
    ServerDeviceEvents,
    ServerDevicePayloads
} from "@digitalstage/api-types";
import {
    selectCurrentAudioType,
    selectCurrentStageId, selectCurrentVideoType,
    selectP2PEnabled,
    selectReady, selectTurnCredential, selectTurnServers, selectTurnUsername
} from "client/redux/selectors";
import {config} from "./config";
import {useErrorReporting, useMicrophone, useWebcam} from "../..";
import {publishTrack, unpublishTrack} from "../../utils/trackPublishing";
import omit from "lodash/omit";
import {useLogServer} from "../../hooks/useLogServer";

const {trace} = logger('WebRTCService')

type TrackMap = { [trackId: string]: MediaStreamTrack }
type DispatchTrackMapContext = React.Dispatch<React.SetStateAction<TrackMap>>
type TrackStatsMap = { [trackId: string]: RTCStatsReport }
type DispatchTrackStatsMap = React.Dispatch<React.SetStateAction<TrackStatsMap>>

const RemoteVideoTracksContext = React.createContext<TrackMap | null>(null)
const DispatchRemoteVideoTracksContext = React.createContext<DispatchTrackMapContext | null>(null)

const RemoteAudioTracksContext = React.createContext<TrackMap | null>(null)
const DispatchRemoteAudioTracksContext = React.createContext<DispatchTrackMapContext | null>(null)

const TrackStatsContext = React.createContext<TrackStatsMap | null>(null)
const DispatchTrackStatsContext = React.createContext<DispatchTrackStatsMap | null>(null)


const WebRTCProvider = ({children}: { children: React.ReactNode }): JSX.Element => {
    const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<TrackMap>({})
    const [remoteAudioTracks, setRemoteAudioTracks] = React.useState<TrackMap>({})
    const [trackStatistics, setTrackStatistics] = React.useState<TrackStatsMap>({})

    return (
        <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
            <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
                <DispatchRemoteAudioTracksContext.Provider
                    value={setRemoteAudioTracks}
                >
                    <RemoteAudioTracksContext.Provider value={remoteAudioTracks}>
                        <DispatchTrackStatsContext.Provider
                            value={setTrackStatistics}
                        >
                            <TrackStatsContext.Provider value={trackStatistics}>
                                {children}
                            </TrackStatsContext.Provider>
                        </DispatchTrackStatsContext.Provider>
                    </RemoteAudioTracksContext.Provider>
                </DispatchRemoteAudioTracksContext.Provider>
            </RemoteVideoTracksContext.Provider>
        </DispatchRemoteVideoTracksContext.Provider>
    )
}
const useWebRTCRemoteVideos = (): TrackMap => {
    const state = React.useContext(RemoteVideoTracksContext)
    if (state === null)
        throw new Error('useWebRTCRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteAudioTracks = (): TrackMap => {
    const state = React.useContext(RemoteAudioTracksContext)
    if (state === null)
        throw new Error('useWebRTCRemoteAudioTracks must be used within a WebRTCProvider')
    return state
}

export interface WebRTCStatistics {
    // Packet jitter in s
    jitter?: number
    // Average jitter buffer delay in ms
    jitterBufferDelay?: number
    // Avarage Round trip total in ms
    roundTripTime?: number
}

const useWebRTCStats = (trackId: string): WebRTCStatistics | undefined => {
    const state = React.useContext(TrackStatsContext)
    const log = useLogServer()
    if (state === null) throw new Error('useWebRTCStats must be used within a WebRTCProvider')
    const trackStats = state[trackId]
    return React.useMemo(() => {
        if (trackStats) {
            const stats: WebRTCStatistics = {}
            trackStats.forEach((value, key) => {
                if (key.startsWith('RTCIceCandidatePair')) {
                    if (value.currentRoundTripTime) {
                        stats.roundTripTime = round(parseFloat(value.currentRoundTripTime) * 1000)
                    } else if (value.roundTripTime) {
                        stats.roundTripTime = round(parseFloat(value.roundTripTime) * 1000)
                    } else if (value.totalRoundTripTime && value.roundTripTimeMeasurements) {
                        stats.roundTripTime = round(
                            (parseFloat(value.roundTripTime) /
                                parseFloat(value.roundTripTimeMeasurements)) *
                            1000
                        )
                    }
                }
                if (key.startsWith('RTCInboundRTP') && value.jitter) {
                    stats.jitter = round(parseFloat(value.jitter), 2)
                }
                if (
                    key.startsWith('RTCMediaStreamTrack') &&
                    value.jitterBufferDelay &&
                    value.jitterBufferEmittedCount
                ) {
                    stats.jitterBufferDelay = round(
                        (parseFloat(value.jitterBufferDelay) /
                            parseInt(value.jitterBufferEmittedCount)) *
                        1000
                    )
                }
                // Also send to log server
                let trace = {};
                trackStats.forEach((value, key) => {
                    trace = {
                        ...trace,
                        [key]: value
                    };
                })
                log(ClientLogEvents.PeerStats, {
                    stats: trackStats
                } as ClientLogPayloads.PeerStats)
            })
            return stats
        }
        return undefined
    }, [trackStats, log])
}

const PeerConnectionWrapper = ({
                                   configuration,
                                   stageDeviceId,
                                   localStageDeviceId,
                                   onOffer,
                                   onAnswer,
                                   onCandidate,
                                   onRemoteTrack,
                                   onRemoteStats,
                                   remoteCandidate,
                                   remoteSessionDescription,
                                   videoTrack,
                                   audioTrack,
                               }: {
    configuration?: RTCConfiguration,
    stageDeviceId: string,
    localStageDeviceId: string,
    onOffer: (offer: ClientDevicePayloads.SendP2POffer) => unknown,
    onAnswer: (offer: ClientDevicePayloads.SendP2PAnswer) => unknown,
    onCandidate: (candidate: ClientDevicePayloads.SendIceCandidate) => unknown,
    onRemoteTrack: (stageDeviceId: string, track: MediaStreamTrack) => unknown,
    onRemoteStats: (stageDeviceId: string, stats: RTCStatsReport) => unknown,
    remoteCandidate?: RTCIceCandidate,
    remoteSessionDescription?: RTCSessionDescriptionInit,
    videoTrack?: MediaStreamTrack,
    audioTrack?: MediaStreamTrack,
}): JSX.Element | null => {
    // Dependencies
    const reportError = useErrorReporting()
    const log = useLogServer()
    const state = useTrackedSelector()
    const targetDeviceId = state.stageDevices.byId[stageDeviceId].deviceId

    // Internal states
    const [, setReceivedTracks] = React.useState<MediaStreamTrack[]>([])
    const [peerConnection, setPeerConnection] = React.useState<PeerConnection | undefined>(undefined);

    // Internal hooks
    React.useEffect(() => {
        if (localStageDeviceId && targetDeviceId && stageDeviceId && onOffer && onAnswer && onCandidate && onRemoteStats && onRemoteTrack && log) {
            trace(`Created new peer connection ${stageDeviceId}`)

            const onSessionDescription = ((description: RTCSessionDescriptionInit) => {
                if (description.type == "offer") {
                    onOffer({
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        offer: description
                    });
                } else if (description.type == "answer") {
                    onAnswer({
                        from: localStageDeviceId,
                        to: stageDeviceId,
                        answer: description
                    });
                }
            });
            const onIceCandidate = ((candidate: RTCIceCandidate | null) => {
                onCandidate({
                    from: localStageDeviceId,
                    to: stageDeviceId,
                    iceCandidate: candidate
                });
            });
            const onRemoteWebRTCTrack = (track: MediaStreamTrack, stats?: RTCStatsReport) => {
                trace("Got new remote track")
                onRemoteTrack(stageDeviceId, track)
                setReceivedTracks((prev) => [...prev, track])
                if (stats) {
                    onRemoteStats(track.id, stats)
                }
                const onEnded = () =>
                    setReceivedTracks((prev) => prev.filter((t) => t.id !== track.id))
                track.addEventListener('mute', onEnded)
                track.addEventListener('ended', onEnded)
            }
            const onRemoteStream = () => {
                // TODO: WebRTC Data channel handling
            }
            const onSignalingStateChange = (state: RTCSignalingState) => {
                // Connected or disconnected
                log(ClientLogEvents.RTCSignalingStateChanged, {
                    targetDeviceId,
                    state: state
                } as ClientLogPayloads.RTCSignalingStateChanged)
            }
            const onIceConnectionStateChange = (state: RTCIceConnectionState) => {
                log(ClientLogEvents.RTCIceConnectionStateChanged, {
                    targetDeviceId,
                    state
                } as ClientLogPayloads.RTCIceConnectionStateChanged)
            }
            const onConnectionStateChange = (state: RTCPeerConnectionState) => {
                log(ClientLogEvents.RTCPeerConnectionStateChanged, {
                    targetDeviceId,
                    state
                } as ClientLogPayloads.RTCPeerConnectionStateChanged)
            }
            const onIceCandidateError = (error: RTCPeerConnectionIceErrorEvent) => {
                log(ClientLogEvents.IceCandidateError, {
                    targetDeviceId,
                    error
                } as ClientLogPayloads.IceCandidateError)
                console.warn(`ICE Candidate error ${error.errorCode}: ${error.errorText} using STUN server ${error.url} and connected as ${error.address} on port ${error.port}`)
            }
            const polite = localStageDeviceId.localeCompare(stageDeviceId) > 0;
            const connection = new PeerConnection({
                polite,
                configuration,
                onRemoteTrack: onRemoteWebRTCTrack,
                onSessionDescription,
                onIceCandidate,
                onRemoteStream,
                onIceConnectionStateChange,
                onConnectionStateChange,
                onIceCandidateError,
                onSignalingStateChange
            });
            setPeerConnection(connection)
            return () => {
                connection.close();
                setPeerConnection(undefined)
            }
        }
    }, [configuration, localStageDeviceId, onAnswer, onCandidate, onOffer, onRemoteStats, onRemoteTrack, stageDeviceId, targetDeviceId, log, reportError]);

    React.useEffect(() => {
        if (peerConnection && reportError) {
            if (remoteSessionDescription) {
                peerConnection.addSessionDescription(remoteSessionDescription)
                    .catch(err => {
                        reportError(err)
                    })
            }

        }
    }, [peerConnection, remoteSessionDescription, reportError])

    React.useEffect(() => {
        if (peerConnection && reportError) {
            if (remoteCandidate) {
                peerConnection.addIceCandidate(remoteCandidate)
                    .catch(err => {
                        console.error(err)
                    })
            }

        }
    }, [peerConnection, remoteCandidate, reportError])

    React.useEffect(() => {
        if (peerConnection && videoTrack) {
            peerConnection.addTrack(videoTrack)
        }
    }, [peerConnection, videoTrack])

    React.useEffect(() => {
        if (peerConnection && audioTrack) {
            peerConnection.addTrack(audioTrack)
        }
    }, [peerConnection, audioTrack])

    return null;
}

type RemoteSessionDescriptions = {
    [from: string]: RTCSessionDescriptionInit
}
type RemoteCandidates = {
    [from: string]: RTCIceCandidate
}

function filterByList<T>(prev: { [from: string]: T }, idList: string[]): { [from: string]: T } {
    return Object.keys(prev).reduce((p, currStageDeviceId) => {
        if (!idList.some(stageDeviceId => currStageDeviceId == stageDeviceId)) {
            return {
                ...p,
                [currStageDeviceId]: prev[currStageDeviceId]
            }
        }
        return p
    }, {})
}

const WebRTCService = (): JSX.Element | null => {
    const reportError = useErrorReporting()
    // Dependencies - Connection
    const connection = useConnection()
    const emit = connection ? connection.emit : undefined
    // Dependencies - Selectors
    const state = useTrackedSelector()
    const connected = selectReady(state)
    const [initialized, setInitialized] = React.useState<boolean>(false)
    const turnServers = selectTurnServers(state)
    const turnUsername = selectTurnUsername(state)
    const turnCredential = selectTurnCredential(state)
    const useP2P = selectP2PEnabled(state)
    const stageId = selectCurrentStageId(state)
    const videoType = selectCurrentVideoType(state)
    const audioType = selectCurrentAudioType(state)
    const localStageDeviceId = state.globals.localStageDeviceId
    const stageDeviceIds = React.useMemo(() => state.globals.stageId && state.globals.localStageDeviceId
        ? state.stageDevices.byStage[state.globals.stageId]?.filter((id) => id !== state.globals.localStageDeviceId && state.stageDevices.byId[id].active) || []
        : [], [state.globals.localStageDeviceId, state.globals.stageId, state.stageDevices.byId, state.stageDevices.byStage]);

    // Internal states
    const [remoteSessionDescriptions, setRemoteSessionDescriptions] = React.useState<RemoteSessionDescriptions>({});
    const [remoteCandidates, setRemoteCandidates] = React.useState<RemoteCandidates>({});
    const configuration: RTCConfiguration = React.useMemo<RTCConfiguration>(() => {
        trace(turnServers.length > 0 ? `Using TURN servers ${turnServers}` : 'Fallback to public STUN servers')
        return turnServers.length > 0 ? {
            ...config,
            iceServers: [
                {
                    urls: turnServers.map(url => `turn:${url}`),
                    username: turnUsername,
                    credential: turnCredential
                }
            ],
            sdpSemantics: 'unified-plan'
        } : config
    }, [turnCredential, turnServers, turnUsername])

    // Internal hooks
    React.useEffect(() => {
        if (connection) {
            const handleOffer = (payload: ServerDevicePayloads.P2POfferSent) => {
                setRemoteSessionDescriptions(prev => ({
                    ...prev,
                    [payload.from]: payload.offer
                }))
            }
            connection.addListener(ServerDeviceEvents.P2POfferSent, handleOffer)
            const handleAnswer = (payload: ServerDevicePayloads.P2PAnswerSent) => {
                setRemoteSessionDescriptions(prev => ({
                    ...prev,
                    [payload.from]: payload.answer
                }))
            }
            connection.addListener(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
            const handleCandidate = (payload: ServerDevicePayloads.IceCandidateSent) => {
                setRemoteCandidates(prev => ({
                    ...prev,
                    [payload.from]: payload.iceCandidate
                }))
            }
            connection.addListener(ServerDeviceEvents.IceCandidateSent, handleCandidate)
            setInitialized(true);
            return () => {
                setInitialized(false);
                connection.removeListener(ServerDeviceEvents.P2POfferSent, handleOffer)
                connection.removeListener(ServerDeviceEvents.P2PAnswerSent, handleAnswer)
                connection.removeListener(ServerDeviceEvents.IceCandidateSent, handleCandidate)

            }
        }
    }, [connection])

    React.useEffect(() => {
        // Clean up
        trace("Cleaning up")
        setRemoteSessionDescriptions(prev => filterByList<RTCSessionDescriptionInit>(prev, stageDeviceIds))
        setRemoteCandidates(prev => filterByList<RTCIceCandidate>(prev, stageDeviceIds))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stageDeviceIds.length])

    /**
     * Capture local video track
     */
    const localVideoTrack = useWebcam()
    const [publishedVideoTrack, setPublishedVideoTrack] = React.useState<MediaStreamTrack>()
    React.useEffect(() => {
        if (
            emit &&
            stageId &&
            videoType === 'mediasoup' &&
            localVideoTrack &&
            useP2P
        ) {
            let publishedId: string
            const track = localVideoTrack.clone()
            const settings = localVideoTrack.getSettings()
            //const capabilities = !!localVideoTrack.getCapabilities && localVideoTrack.getCapabilities()
            publishTrack(emit, stageId, 'video', {
                //capabilities,
                ...settings,
                trackId: localVideoTrack.id,
                type: 'browser',
            })
                .then((videoTrack) => {
                    publishedId = videoTrack._id
                    setPublishedVideoTrack(track)
                    trace(`Published local video track with trackId ${track.id} as video ${publishedId}`)
                })
                .catch(error => {
                    reportError(`Could not publish local video track ${track.id}. Reason: ${error}`)
                })
            return () => {
                setPublishedVideoTrack(undefined)
                if (publishedId) {
                    unpublishTrack(emit, publishedId, "video")
                        .then(() => trace(`Un-published local video track ${track.id} published as video ${publishedId}`))
                        //FIXME: Currently just reporting to the console and NOT throwing, but sometimes tracks wasn't published for any reason
                        .catch(error => reportError(`Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${error}`))
                }
                if (track) {
                    track.stop()
                }
            }
        }
    }, [useP2P, stageId, videoType, emit, localVideoTrack, reportError])

    /**
     * Capture local audio track
     */
    const localAudioTrack = useMicrophone()
    const [publishedAudioTrack, setPublishedAudioTrack] = React.useState<MediaStreamTrack>()
    React.useEffect(() => {
        if (
            emit &&
            stageId &&
            audioType === 'mediasoup' &&
            useP2P &&
            localAudioTrack
        ) {
            let publishedId: string | undefined
            const track = localAudioTrack.clone()
            const settings = localAudioTrack.getSettings()
            //const capabilities = localAudioTrack.getCapabilities()
            publishTrack(emit, stageId, 'audio', {
                //capabilities,
                ...settings,
                trackId: localAudioTrack.id,
                type: 'browser',
            })
                .then((audioTrack) => {
                    publishedId = audioTrack._id
                    setPublishedAudioTrack(track)
                    trace(`Published local audio track with trackId ${track.id} as audio ${publishedId}`)
                })
                .catch(error => reportError(`Could not publish local audio track ${track.id}. Reason: ${error}`))
            return () => {
                if (publishedId) {
                    unpublishTrack(emit, publishedId, "audio")
                        .then(() => trace(`Un-published local audio track ${track.id} published as audio ${publishedId}`))
                        //FIXME: Currently just reporting to the console and NOT throwing, but sometimes tracks wasn't published for any reason
                        .catch((error) => reportError(`Could not un-publish local audio track ${track?.id} published as audio ${publishedId}. Reason: ${error}`))
                }
                setPublishedAudioTrack(undefined)
                if (track) {
                    track.stop()
                }
            }
        }
    }, [useP2P, stageId, audioType, emit, reportError, localAudioTrack])

    const handleOffer = React.useCallback((offer: ClientDevicePayloads.SendP2POffer) => {
        if (emit)
            emit(ClientDeviceEvents.SendP2POffer, offer)
    }, [emit])
    const handleAnswer = React.useCallback((answer: ClientDevicePayloads.SendP2PAnswer) => {
        if (emit)
            emit(ClientDeviceEvents.SendP2PAnswer, answer)
    }, [emit])
    const handleCandidate = React.useCallback((candidate: ClientDevicePayloads.SendIceCandidate) => {
        if (emit)
            emit(ClientDeviceEvents.SendIceCandidate, candidate)
    }, [emit])
    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    const setRemoteAudioTracks = React.useContext(DispatchRemoteAudioTracksContext)
    const handleRemoteTrack = React.useCallback((stageDeviceId: string, track: MediaStreamTrack) => {
        trace('Got track with trackId', track.id)
        const dispatch = track.kind === 'video' ? setRemoteVideoTracks : setRemoteAudioTracks
        if (dispatch) {
            trace('Adding track with trackId', track.id)
            dispatch((prev) => ({
                ...prev,
                [stageDeviceId]: track,
            }))
            const onTrackMuted = () => {
                trace(`Track ${track.id} muted`)
            }
            const onTrackUnmuted = () => {
                trace(`Track ${track.id} unmuted`)
            }
            const onTrackEnded = () => {
                trace("Track ended, removing it from internal lit")
                dispatch((prev) => omit(prev, stageDeviceId))
                track.removeEventListener('mute', onTrackMuted)
                track.removeEventListener('unmute', onTrackUnmuted)
                track.removeEventListener('ended', onTrackEnded)
            }
            track.addEventListener('mute', onTrackMuted)
            track.addEventListener('unmute', onTrackUnmuted)
            track.addEventListener('ended', onTrackEnded)
        }
    }, [setRemoteAudioTracks, setRemoteVideoTracks])
    const log = useLogServer()
    const handleRemoteStats = React.useCallback((trackId: string, trackStats: RTCStatsReport) => {
        const stats: WebRTCStatistics = {}
        let trace = {};
        trackStats.forEach((value, key) => {
            if (key.startsWith('RTCIceCandidatePair')) {
                if (value.currentRoundTripTime) {
                    stats.roundTripTime = round(parseFloat(value.currentRoundTripTime) * 1000)
                } else if (value.roundTripTime) {
                    stats.roundTripTime = round(parseFloat(value.roundTripTime) * 1000)
                } else if (value.totalRoundTripTime && value.roundTripTimeMeasurements) {
                    stats.roundTripTime = round(
                        (parseFloat(value.roundTripTime) /
                            parseFloat(value.roundTripTimeMeasurements)) *
                        1000
                    )
                }
            }
            if (key.startsWith('RTCInboundRTP') && value.jitter) {
                stats.jitter = round(parseFloat(value.jitter), 2)
            }
            if (
                key.startsWith('RTCMediaStreamTrack') &&
                value.jitterBufferDelay &&
                value.jitterBufferEmittedCount
            ) {
                stats.jitterBufferDelay = round(
                    (parseFloat(value.jitterBufferDelay) /
                        parseInt(value.jitterBufferEmittedCount)) *
                    1000
                )
            }
            trace = {
                ...trace,
                [key]: value
            };
        })
        // Also send to log server
        log(ClientLogEvents.PeerStats, {
            stats: trace
        } as ClientLogPayloads.PeerStats)
    }, [log])

    if (connected && initialized && localStageDeviceId) {
        return (
            <>
                {stageDeviceIds.map(stageDeviceId =>
                    <PeerConnectionWrapper
                        key={stageDeviceId}
                        configuration={configuration}
                        stageDeviceId={stageDeviceId}
                        localStageDeviceId={localStageDeviceId}
                        onOffer={handleOffer}
                        onAnswer={handleAnswer}
                        onCandidate={handleCandidate}
                        onRemoteTrack={handleRemoteTrack}
                        onRemoteStats={handleRemoteStats}
                        remoteCandidate={remoteCandidates[stageDeviceId]}
                        remoteSessionDescription={remoteSessionDescriptions[stageDeviceId]}
                        videoTrack={publishedVideoTrack}
                        audioTrack={publishedAudioTrack}
                    />)}
            </>
        )
    }
    return null
}

export {WebRTCService, WebRTCProvider, useWebRTCRemoteVideos, useWebRTCRemoteAudioTracks, useWebRTCStats}
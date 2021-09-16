import React from 'react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    ServerDeviceEvents, WebRTCAudioTrack, WebRTCVideoTrack,
} from '@digitalstage/api-types'

import {useStageSelector} from '../../redux/selectors/useStageSelector'
import {useConnection} from '../ConnectionService'
import {PeerConnection} from './PeerConnection'
import omit from 'lodash/omit'
import {logger} from '../../logger'
import {Broker} from './Broker'
import round from 'lodash/round'
import {useMicrophone} from "../../provider/MicrophoneProvider";
import {useErrorReporting} from '../../hooks/useErrorReporting'
import {useWebcam} from '../../provider/WebcamProvider'

const {trace} = logger('WebRTCService')

type TrackMap = { [trackId: string]: MediaStreamTrack }
type DispatchTrackMapContext = React.Dispatch<React.SetStateAction<TrackMap>>
type TrackStatsMap = { [trackId: string]: RTCStatsReport }
type DispatchTrackStatsMap = React.Dispatch<React.SetStateAction<TrackStatsMap>>

const RemoteVideoTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteVideoTracksContext = React.createContext<DispatchTrackMapContext>(undefined)

const RemoteAudioTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteAudioTracksContext = React.createContext<DispatchTrackMapContext>(undefined)

const TrackStatsContext = React.createContext<TrackStatsMap>(undefined)
const DispatchTrackStatsContext = React.createContext<DispatchTrackStatsMap>(undefined)

const WebRTCProvider = ({children}: { children: React.ReactNode }) => {
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
    if (state === undefined)
        throw new Error('useWebRTCRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteAudioTracks = (): TrackMap => {
    const state = React.useContext(RemoteAudioTracksContext)
    if (state === undefined)
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

const useWebRTCStats = (trackId: string): WebRTCStatistics => {
    const state = React.useContext(TrackStatsContext)
    if (state === undefined) throw new Error('useWebRTCStats must be used within a WebRTCProvider')
    const trackStats = state[trackId]
    return React.useMemo(() => {
        if (trackStats) {
            let stats: WebRTCStatistics = {}
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
            })
            return stats
        }
        return undefined
    }, [trackStats])
}

const WebRTCService = (): JSX.Element => {
    const initialized = useStageSelector(state => state.globals.ready)
    const connection = useConnection()
    const emit = connection ? connection.emit : undefined
    const reportError = useErrorReporting()
    const [connected, setConnected] = React.useState<boolean>(false)
    const broker = React.useRef<Broker>(new Broker())
    const useP2P = useStageSelector<boolean>(state => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].useP2P : false)
    const stageId = useStageSelector((state) => state.globals.stageId)
    const videoType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].videoType : undefined
    )
    const audioType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].audioType : undefined
    )
    const stageDeviceIds = useStageSelector<string[]>((state) =>
        state.globals.localStageDeviceId
            ? state.stageDevices.byStage[stageId]?.filter(
            (id) =>
                id !== state.globals.localStageDeviceId && state.stageDevices.byId[id].active
        ) || []
            : []
    )
    React.useEffect(() => {
        if (connection) {
            const currentBroker = broker.current
            connection.on(ServerDeviceEvents.P2PRestart, currentBroker.handleRestart)
            connection.on(ServerDeviceEvents.P2POfferSent, currentBroker.handleOffer)
            connection.on(ServerDeviceEvents.P2PAnswerSent, currentBroker.handleAnswer)
            connection.on(ServerDeviceEvents.IceCandidateSent, currentBroker.handleIceCandidate)
            setConnected(true)
            return () => {
                setConnected(false)
                connection.on(ServerDeviceEvents.P2PRestart, currentBroker.handleRestart)
                connection.off(ServerDeviceEvents.P2POfferSent, currentBroker.handleOffer)
                connection.off(ServerDeviceEvents.P2PAnswerSent, currentBroker.handleAnswer)
                connection.off(
                    ServerDeviceEvents.IceCandidateSent,
                    currentBroker.handleIceCandidate
                )
            }
        }
    }, [connection])

    /**
     * Capture local video track
     */
    const localVideoTrack = useWebcam()
    const [publishedVideoTrack, setPublishedVideoTrack] = React.useState<MediaStreamTrack>()
    React.useEffect(() => {
        if (
            reportError &&
            stageId &&
            videoType === 'mediasoup' &&
            localVideoTrack &&
            useP2P
        ) {
            let publishedId: string
            const track = localVideoTrack.clone()
            emit(
                ClientDeviceEvents.CreateVideoTrack,
                {
                    stageId,
                    trackId: track.id,
                    type: 'browser',
                } as ClientDevicePayloads.CreateVideoTrack,
                (error: string | null, videoTrack: WebRTCVideoTrack) => {
                    if (error) {
                        reportError(`Could not publish local video track ${track.id}. Reason: ${error}`)
                    } else {
                        publishedId = videoTrack._id
                        setPublishedVideoTrack(track)
                        trace(`Published local video track with trackId ${track.id} as video ${publishedId}`)
                    }
                }
            )
            return () => {
                setPublishedVideoTrack(undefined)
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                reportError(
                                    `Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${error}`
                                )
                            } else {
                                trace(`Un-published local video track ${track.id} published as video ${publishedId}`)
                            }
                        }
                    )
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
            reportError &&
            stageId &&
            audioType === 'mediasoup' &&
            useP2P &&
            localAudioTrack
        ) {
            let publishedId: string = undefined
            const track = localAudioTrack.clone()
            emit(
                ClientDeviceEvents.CreateAudioTrack,
                {
                    stageId,
                    trackId: track.id,
                    type: 'browser',
                } as ClientDevicePayloads.CreateAudioTrack,
                (error: string | null, audioTrack: WebRTCAudioTrack) => {
                    if (error) {
                        reportError(`Could not publish local audio track ${track.id}. Reason: ${error}`)
                    } else {
                        publishedId = audioTrack._id
                        setPublishedAudioTrack(track)
                        trace(`Published local audio track with trackId ${track.id} as audio ${publishedId}`)
                    }
                }
            )
            return () => {
                setPublishedAudioTrack(undefined)
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveAudioTrack,
                        publishedId as ClientDevicePayloads.RemoveAudioTrack,
                        (error: string | null) => {
                            if (error) {
                                reportError(
                                    `Could not un-publish local audio track ${track?.id} published as audio ${publishedId}. Reason: ${error}`
                                )
                            } else {
                                trace(`Un-published local audio track ${track.id} published as audio ${publishedId}`)
                            }
                        }
                    )
                }
                if (track) {
                    track.stop()
                }
            }
        }
    }, [useP2P, stageId, audioType, emit, reportError, localAudioTrack])

    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    const setRemoteAudioTracks = React.useContext(DispatchRemoteAudioTracksContext)

    const onRemoteTrack = React.useCallback(
        (stageDeviceId: string, track: MediaStreamTrack) => {
            trace('Got track with trackId', track.id)
            const dispatch = track.kind === 'video' ? setRemoteVideoTracks : setRemoteAudioTracks
            trace('Adding track with trackId', track.id)
            dispatch((prev) => ({
                ...prev,
                [stageDeviceId]: track,
            }))
            const onEndTrack = () => {
                dispatch((prev) => omit(prev, stageDeviceId))
                track.removeEventListener('mute', onEndTrack)
                track.removeEventListener('ended', onEndTrack)
            }
            track.addEventListener('mute', onEndTrack)
            track.addEventListener('ended', onEndTrack)
        },
        [setRemoteAudioTracks, setRemoteVideoTracks]
    )
    const setWebRTCStats = React.useContext(DispatchTrackStatsContext)
    const onStats = React.useCallback(
        (trackId: string, stats: RTCStatsReport) => {
            setWebRTCStats((prev) => ({
                ...prev,
                [trackId]: stats,
            }))
        },
        [setWebRTCStats]
    )
    if (initialized && connected) {
        return (
            <>
                {stageDeviceIds.map((stageDeviceId) => (
                    <PeerConnection
                        key={stageDeviceId}
                        videoTrack={publishedVideoTrack}
                        audioTrack={publishedAudioTrack}
                        stageDeviceId={stageDeviceId}
                        onRemoteTrack={onRemoteTrack}
                        onStats={onStats}
                        broker={broker.current}
                    />
                ))}
            </>
        )
    }
    return null
}
export {
    WebRTCService,
    WebRTCProvider,
    useWebRTCRemoteVideos,
    useWebRTCRemoteAudioTracks,
    useWebRTCStats,
}

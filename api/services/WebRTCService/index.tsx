import React from 'react'
import {
    BrowserDevice,
    ClientDeviceEvents,
    ClientDevicePayloads,
    ServerDeviceEvents,
} from '@digitalstage/api-types'
import { shallowEqual } from 'react-redux'
import { getVideoTrack } from '../../utils/getVideoTrack'

import { useStageSelector } from 'api/redux/selectors/useStageSelector'
import { useConnection } from '../ConnectionService'
import { PeerConnection } from './PeerConnection'
import { getAudioTrack } from '../../utils/getAudioTrack'
import omit from 'lodash/omit'
import { logger } from '../../logger'
import { useErrorReporting } from '@digitalstage/api-client-react'
import { Broker } from './Broker'
import round from 'lodash/round'
import {USE_STAGEDEVICE_IDS} from "./config";

const { trace } = logger('WebRTCService')

type DispatchMediaStreamTrackContext = React.Dispatch<React.SetStateAction<MediaStreamTrack>>
type TrackMap = { [trackId: string]: MediaStreamTrack }
type DispatchTrackMapContext = React.Dispatch<React.SetStateAction<TrackMap>>
type TrackStatsMap = { [trackId: string]: RTCStatsReport }
type DispatchTrackStatsMap = React.Dispatch<React.SetStateAction<TrackStatsMap>>

const RemoteVideoTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteVideoTracksContext = React.createContext<DispatchTrackMapContext>(undefined)

const LocalVideoTrackContext = React.createContext<MediaStreamTrack>(undefined)
const DispatchLocalVideoTrackContext =
    React.createContext<DispatchMediaStreamTrackContext>(undefined)

const RemoteAudioTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteAudioTracksContext = React.createContext<DispatchTrackMapContext>(undefined)

const LocalAudioTrackContext = React.createContext<MediaStreamTrack>(undefined)
const DispatchLocalAudioTrackContext =
    React.createContext<DispatchMediaStreamTrackContext>(undefined)

const TrackStatsContext = React.createContext<TrackStatsMap>(undefined)
const DispatchTrackStatsContext = React.createContext<DispatchTrackStatsMap>(undefined)

const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const [localVideoTracks, setLocalVideoTracks] = React.useState<MediaStreamTrack>(undefined)
    const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<TrackMap>({})
    const [localAudioTracks, setLocalAudioTracks] = React.useState<MediaStreamTrack>(undefined)
    const [remoteAudioTracks, setRemoteAudioTracks] = React.useState<TrackMap>({})
    const [trackStatistics, setTrackStatistics] = React.useState<TrackStatsMap>({})

    return (
        <DispatchLocalVideoTrackContext.Provider value={setLocalVideoTracks}>
            <LocalVideoTrackContext.Provider value={localVideoTracks}>
                <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
                    <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
                        <DispatchLocalAudioTrackContext.Provider value={setLocalAudioTracks}>
                            <LocalAudioTrackContext.Provider value={localAudioTracks}>
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
                            </LocalAudioTrackContext.Provider>
                        </DispatchLocalAudioTrackContext.Provider>
                    </RemoteVideoTracksContext.Provider>
                </DispatchRemoteVideoTracksContext.Provider>
            </LocalVideoTrackContext.Provider>
        </DispatchLocalVideoTrackContext.Provider>
    )
}
const useWebRTCLocalVideo = (): MediaStreamTrack => React.useContext(LocalVideoTrackContext)
const useWebRTCRemoteVideos = (): TrackMap => {
    const state = React.useContext(RemoteVideoTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteVideoByStageDevice = (stageDeviceId: string): MediaStreamTrack => {
    const tracks = useWebRTCRemoteVideos()
    return React.useMemo(() => {
        return tracks[stageDeviceId]
    }, [stageDeviceId, tracks])
}
const useWebRTCLocalAudioTrack = (): MediaStreamTrack => React.useContext(LocalAudioTrackContext)
const useWebRTCRemoteAudioTracks = (): TrackMap => {
    const state = React.useContext(RemoteAudioTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCRemoteAudioTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteAudioTrackByStageDevice = (stageMemberId: string): MediaStreamTrack => {
    const tracks = useWebRTCRemoteAudioTracks()
    console.log(tracks)
    return React.useMemo(() => {
        return tracks[stageMemberId]
    }, [stageMemberId, tracks])
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
            console.log(stats)
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
    const localStageDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localStageDeviceId
    )
    const broker = React.useRef<Broker>(new Broker())
    const {
        inputVideoDeviceId,
        sendVideo,
        sendAudio,
        useP2P,
        inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
    } = useStageSelector<{
        inputVideoDeviceId?: string
        sendVideo?: boolean
        sendAudio?: boolean
        useP2P?: boolean
        inputAudioDeviceId?: string
        autoGainControl?: boolean
        echoCancellation?: boolean
        noiseSuppression?: boolean
        sampleRate?: number
    }>((state) => {
        if (state.globals.localDeviceId) {
            const localDevice = state.devices.byId[state.globals.localDeviceId] as BrowserDevice
            return {
                inputVideoDeviceId: localDevice.inputVideoDeviceId,
                sendVideo: localDevice.sendVideo,
                sendAudio: localDevice.sendAudio,
                useP2P: localDevice.useP2P,
                inputAudioDeviceId: localDevice.inputAudioDeviceId,
                autoGainControl: localDevice.autoGainControl,
                echoCancellation: localDevice.echoCancellation,
                noiseSuppression: localDevice.noiseSuppression,
                sampleRate: localDevice.sampleRate,
            }
        }
        return {}
    }, shallowEqual)
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
    const setLocalVideoTrack = React.useContext(DispatchLocalVideoTrackContext)
    React.useEffect(() => {
        if (
            stageId &&
            videoType === 'mediasoup' &&
            setLocalVideoTrack &&
            localStageDeviceId &&
            sendVideo &&
            useP2P
        ) {
            trace('Fetching video tracks')
            let abort = false
            let addedTrack: MediaStreamTrack = undefined
            let publishedId: string
            getVideoTrack(inputVideoDeviceId).then((track) => {
                if (abort) {
                    track.stop()
                } else {
                    addedTrack = track
                    trace('Publishing video track by trackId', track.id)
                    emit(
                        ClientDeviceEvents.CreateVideoTrack,
                        {
                            stageId,
                            trackId: track.id,
                            type: 'browser',
                        } as ClientDevicePayloads.CreateVideoTrack,
                        (error: string | null, videoTrack) => {
                            if (error) {
                                console.error(
                                    `Could not publish local video track. Reason: ${error}`
                                )
                            } else {
                                trace('Published local video track')
                                publishedId = videoTrack._id
                            }
                        }
                    )
                    setLocalVideoTrack(track)
                }
            })
            return () => {
                trace('Cleaning up video tracks')
                abort = true
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                console.error(
                                    `Could not UNpublish local video track. Reason: ${error}`
                                )
                            } else {
                                trace('UNpublished local video track')
                            }
                        }
                    )
                }
                if (addedTrack) {
                    setLocalVideoTrack(undefined)
                    trace('Stopping track')
                    addedTrack.stop()
                }
            }
        }
    }, [
        inputVideoDeviceId,
        sendVideo,
        useP2P,
        stageId,
        localStageDeviceId,
        videoType,
        emit,
        setLocalVideoTrack,
    ])
    /**
     * Capture local audio track
     */
    const setLocalAudioTrack = React.useContext(DispatchLocalAudioTrackContext)
    React.useEffect(() => {
        if (
            stageId &&
            audioType === 'mediasoup' &&
            setLocalAudioTrack &&
            localStageDeviceId &&
            sendAudio &&
            useP2P
        ) {
            trace('Fetching audio tracks')
            let abort = false
            let addedTrack: MediaStreamTrack = undefined
            let publishedId: string = undefined
            getAudioTrack({
                deviceId: inputAudioDeviceId,
                autoGainControl,
                echoCancellation,
                noiseSuppression,
                sampleRate,
            }).then((track) => {
                if (abort) {
                    track.stop()
                } else {
                    addedTrack = track
                    trace('Publishing audio track by trackId', track.id)
                    emit(
                        ClientDeviceEvents.CreateAudioTrack,
                        {
                            stageId,
                            trackId: track.id,
                            type: 'browser',
                        } as ClientDevicePayloads.CreateAudioTrack,
                        (error: string | null, audioTrack) => {
                            if (error) {
                                console.error(
                                    `Could not publish local audio track. Reason: ${error}`
                                )
                                reportError(`Could not publish local audio track. Reason: ${error}`)
                            } else {
                                trace('Published local audio track')
                                publishedId = audioTrack._id
                            }
                        }
                    )
                    setLocalAudioTrack(track)
                }
            })
            return () => {
                trace('Cleaning up audio tracks')
                abort = true
                if (publishedId) {
                    emit(
                        ClientDeviceEvents.RemoveAudioTrack,
                        publishedId as ClientDevicePayloads.RemoveAudioTrack,
                        (error: string | null) => {
                            if (error) {
                                console.error(
                                    `Could not UNpublish local audio track. Reason: ${error}`
                                )
                                reportError(
                                    `Could not UNpublish local audio track. Reason: ${error}`
                                )
                            } else {
                                trace('UNpublished local audio track')
                            }
                        }
                    )
                }
                if (addedTrack) {
                    setLocalAudioTrack(undefined)
                    trace('Stopping track')
                    addedTrack.stop()
                }
            }
        }
    }, [
        useP2P,
        inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
        stageId,
        localStageDeviceId,
        audioType,
        emit,
        setLocalAudioTrack,
        sendAudio,
        reportError,
    ])

    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    const setRemoteAudioTracks = React.useContext(DispatchRemoteAudioTracksContext)

    const onRemoteTrack = React.useCallback(
        (stageDeviceId: string, track: MediaStreamTrack) => {
            trace('Got track with trackId', track.id)
            const dispatch = track.kind === 'video' ? setRemoteVideoTracks : setRemoteAudioTracks
            trace('Adding track with trackId', track.id)
            dispatch((prev) => ({
                ...prev,
                [USE_STAGEDEVICE_IDS ? stageDeviceId : track.id]: track,
            }))
            const onEndTrack = () => {
                dispatch((prev) => omit(prev, USE_STAGEDEVICE_IDS ? stageDeviceId : track.id))
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
    useWebRTCLocalVideo,
    useWebRTCLocalAudioTrack,
    useWebRTCRemoteVideos,
    useWebRTCRemoteVideoByStageDevice,
    useWebRTCRemoteAudioTracks,
    useWebRTCRemoteAudioTrackByStageDevice,
    useWebRTCStats,
}

import React from 'react'
import {
    BrowserDevice,
    ClientDeviceEvents,
    ClientDevicePayloads,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import { shallowEqual } from 'react-redux'
import { getVideoTracks } from '../../utils/getVideoTracks'

import { useStageSelector } from 'api/redux/useStageSelector'
import { useConnection } from '../ConnectionService'
import { PeerConnection } from './PeerConnection'
import { getAudioTracks } from '../../utils/getAudioTracks'
import omit from 'lodash/omit'
import { trace } from '../../logger'
import { useErrorReporting } from '@digitalstage/api-client-react'

const report = trace('WebRTCService')

type TrackMap = { [id: string]: MediaStreamTrack }
type DispatchTrackMapContext = React.Dispatch<React.SetStateAction<TrackMap>>
type TrackStatsMap = { [id: string]: RTCStatsReport }
type DispatchTrackStatsMap = React.Dispatch<React.SetStateAction<TrackStatsMap>>

const RemoteVideoTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteVideoTracksContext = React.createContext<DispatchTrackMapContext>(undefined)
const LocalVideoTracksContext = React.createContext<TrackMap>(undefined)
const DispatchLocalVideoTracksContext = React.createContext<DispatchTrackMapContext>(undefined)
const RemoteAudioTracksContext = React.createContext<TrackMap>(undefined)
const DispatchRemoteAudioTracksContext = React.createContext<DispatchTrackMapContext>(undefined)
const LocalAudioTracksContext = React.createContext<TrackMap>(undefined)
const DispatchLocalAudioTracksContext = React.createContext<DispatchTrackMapContext>(undefined)
const TrackStatsContext = React.createContext<TrackStatsMap>(undefined)
const DispatchTrackStatsContext = React.createContext<DispatchTrackStatsMap>(undefined)
const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const [localVideoTracks, setLocalVideoTracks] = React.useState<TrackMap>({})
    const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<TrackMap>({})
    const [localAudioTracks, setLocalAudioTracks] = React.useState<TrackMap>({})
    const [remoteAudioTracks, setRemoteAudioTracks] = React.useState<TrackMap>({})
    const [trackStatistics, setTrackStatistics] = React.useState<TrackStatsMap>({})

    return (
        <DispatchLocalVideoTracksContext.Provider value={setLocalVideoTracks}>
            <LocalVideoTracksContext.Provider value={localVideoTracks}>
                <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
                    <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
                        <DispatchLocalAudioTracksContext.Provider value={setLocalAudioTracks}>
                            <LocalAudioTracksContext.Provider value={localAudioTracks}>
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
                            </LocalAudioTracksContext.Provider>
                        </DispatchLocalAudioTracksContext.Provider>
                    </RemoteVideoTracksContext.Provider>
                </DispatchRemoteVideoTracksContext.Provider>
            </LocalVideoTracksContext.Provider>
        </DispatchLocalVideoTracksContext.Provider>
    )
}
const useWebRTCLocalVideoTracks = (): TrackMap => {
    const state = React.useContext(LocalVideoTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCLocalVideoTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteVideoTracks = (): TrackMap => {
    const state = React.useContext(RemoteVideoTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCLocalAudioTracks = (): TrackMap => {
    const state = React.useContext(LocalAudioTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCLocalAudioTracks must be used within a WebRTCProvider')
    return state
}
const useWebRTCRemoteAudioTracks = (): TrackMap => {
    const state = React.useContext(RemoteAudioTracksContext)
    if (state === undefined)
        throw new Error('useWebRTCRemoteAudioTracks must be used within a WebRTCProvider')
    return state
}

export interface WebRTCStatistics {
    jitter?: number
    jitterBufferDelay?: number
    jitterBufferEmittedCount?: number
    roundTripTime?: number
    totalRoundTripTime?: number
    roundTripTimeMeasurements?: number
}

const useWebRTCStats = (trackId: string): WebRTCStatistics => {
    const state = React.useContext(TrackStatsContext)
    if (state === undefined) throw new Error('useWebRTCStats must be used within a WebRTCProvider')
    const trackStats = state[trackId]
    if (trackStats) {
        let stats: WebRTCStatistics = {}
        trackStats.forEach((value, key) => {
            if (key.startsWith('RTCIceCandidatePair')) {
                if (value.roundTripTime) {
                    stats.roundTripTime = parseFloat(value.roundTripTime)
                }
                if (value.totalRoundTripTime) {
                    stats.totalRoundTripTime = parseFloat(value.totalRoundTripTime)
                }
                if (value.roundTripTimeMeasurements) {
                    stats.roundTripTimeMeasurements = parseFloat(value.roundTripTimeMeasurements)
                }
            }
            if (key.startsWith('RTCInboundRTP') && value.jitter) {
                stats.jitter = parseFloat(value.jitter)
            }
            if (key.startsWith('RTCMediaStreamTrack') && value.jitterBufferDelay) {
                stats.jitterBufferDelay = parseFloat(value.jitterBufferDelay)
                stats.jitterBufferEmittedCount = parseInt(value.jitterBufferEmittedCount)
            }
        })
        return stats
    }
    return undefined
}

const WebRTCService = (): JSX.Element => {
    report('RERENDER')
    const connection = useConnection()
    const emit = connection ? connection.emit : undefined
    const reportError = useErrorReporting()
    const [ready, setReady] = React.useState<boolean>(false)
    const localStageDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localStageDeviceId
    )
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

    const [descriptions, setDescriptions] = React.useState<{
        [from: string]: RTCSessionDescriptionInit
    }>({})
    const [candidates, setCandidates] = React.useState<{
        [from: string]: RTCIceCandidate
    }>({})
    React.useEffect(() => {
        if (connection) {
            const handleOffer = ({ from, offer }: ServerDevicePayloads.P2POfferSent) => {
                report(`Received offer from ${from}`)
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: offer,
                }))
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                report(`Received answer from ${from}`)
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: answer,
                }))
            }
            const handleIceCandidate = ({
                from,
                iceCandidate,
            }: ServerDevicePayloads.IceCandidateSent) => {
                report(`Received ice candidate from ${from}`)
                setCandidates((prev) => ({
                    ...prev,
                    [from]: iceCandidate,
                }))
            }
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
    }, [connection])

    /**
     * Capture local video track
     */
    const setLocalVideoTracks = React.useContext(DispatchLocalVideoTracksContext)
    React.useEffect(() => {
        if (
            stageId &&
            videoType === 'mediasoup' &&
            setLocalVideoTracks &&
            localStageDeviceId &&
            sendVideo &&
            useP2P
        ) {
            report('Fetching video tracks')
            let abort = false
            let addedTracks: MediaStreamTrack[] = undefined
            let publishedIds: string[] = []
            getVideoTracks(inputVideoDeviceId).then((tracks) => {
                if (abort) {
                    tracks.forEach((track) => track.stop())
                } else {
                    addedTracks = tracks
                    report(`Have ${tracks.length} tracks`)
                    tracks.forEach((track) => {
                        report('Publishing video track by trackId', track.id)
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
                                    report('Published local video track')
                                    publishedIds.push(videoTrack._id)
                                }
                            }
                        )
                        setLocalVideoTracks((prev) => ({
                            ...prev,
                            [track.id]: track,
                        }))
                    })
                }
            })
            return () => {
                report('Cleaning up video tracks')
                abort = true
                publishedIds.map((publishedId) => {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                console.error(
                                    `Could not UNpublish local video track. Reason: ${error}`
                                )
                            } else {
                                report('UNpublished local video track')
                            }
                        }
                    )
                })
                if (addedTracks) {
                    addedTracks.map((track) => {
                        setLocalVideoTracks((prev) => omit(prev, track.id))
                        report('Stopping track')
                        track.stop()
                    })
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
        setLocalVideoTracks,
    ])
    /**
     * Capture local audio track
     */
    const setLocalAudioTracks = React.useContext(DispatchLocalAudioTracksContext)
    React.useEffect(() => {
        if (
            stageId &&
            audioType === 'mediasoup' &&
            setLocalAudioTracks &&
            localStageDeviceId &&
            sendAudio &&
            useP2P
        ) {
            report('Fetching audio tracks')
            let abort = false
            let addedTracks: MediaStreamTrack[] = undefined
            let publishedIds: string[] = []
            getAudioTracks({
                inputAudioDeviceId,
                autoGainControl,
                echoCancellation,
                noiseSuppression,
                sampleRate,
            }).then((tracks) => {
                if (abort) {
                    tracks.forEach((track) => track.stop())
                } else {
                    addedTracks = tracks
                    report(`Have ${tracks.length} tracks`)
                    tracks.forEach((track) => {
                        report('Publishing audio track by trackId', track.id)
                        emit(
                            ClientDeviceEvents.CreateAudioTrack,
                            {
                                stageId,
                                trackId: track.id,
                                type: 'browser',
                            } as ClientDevicePayloads.CreateAudioTrack,
                            (error: string | null, videoTrack) => {
                                if (error) {
                                    console.error(
                                        `Could not publish local audio track. Reason: ${error}`
                                    )
                                    reportError(
                                        `Could not publish local audio track. Reason: ${error}`
                                    )
                                } else {
                                    report('Published local audio track')
                                    publishedIds.push(videoTrack._id)
                                }
                            }
                        )
                        setLocalAudioTracks((prev) => ({
                            ...prev,
                            [track.id]: track,
                        }))
                    })
                }
            })
            return () => {
                report('Cleaning up audio tracks')
                abort = true
                publishedIds.map((publishedId) => {
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
                                report('UNpublished local audio track')
                            }
                        }
                    )
                })
                if (addedTracks) {
                    addedTracks.map((track) => {
                        setLocalAudioTracks((prev) => omit(prev, track.id))
                        report('Stopping track')
                        track.stop()
                    })
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
        setLocalAudioTracks,
        sendAudio,
    ])

    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    const setRemoteAudioTracks = React.useContext(DispatchRemoteAudioTracksContext)
    const onRemoteTrack = React.useCallback(
        (stageDeviceId: string, track: MediaStreamTrack) => {
            report('Got track with trackId', track.id)
            const dispatch = track.kind === 'video' ? setRemoteVideoTracks : setRemoteAudioTracks
            dispatch((prev) => ({
                ...prev,
                [track.id]: track,
            }))
            const endTrack = () => {
                dispatch((prev) => omit(prev, track.id))
            }
            track.addEventListener('mute', endTrack)
            track.addEventListener('ended', endTrack)
        },
        [setRemoteAudioTracks, setRemoteVideoTracks]
    )
    const setWebRTCStats = React.useContext(DispatchTrackStatsContext)
    const localVideoTracks = React.useContext(LocalVideoTracksContext)
    const localAudioTracks = React.useContext(LocalAudioTracksContext)
    const onStats = React.useCallback(
        (trackId: string, stats: RTCStatsReport) => {
            setWebRTCStats((prev) => ({
                ...prev,
                [trackId]: stats,
            }))
        },
        [setWebRTCStats]
    )
    if (ready) {
        return (
            <>
                {stageDeviceIds.map((stageDeviceId) => (
                    <PeerConnection
                        key={stageDeviceId}
                        stageDeviceId={stageDeviceId}
                        onRemoteTrack={onRemoteTrack}
                        tracks={[
                            ...Object.values(localVideoTracks),
                            ...Object.values(localAudioTracks),
                        ]}
                        onStats={onStats}
                        currentDescription={descriptions[stageDeviceId]}
                        currentCandidate={candidates[stageDeviceId]}
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
    useWebRTCLocalVideoTracks,
    useWebRTCRemoteVideoTracks,
    useWebRTCLocalAudioTracks,
    useWebRTCRemoteAudioTracks,
    useWebRTCStats,
}

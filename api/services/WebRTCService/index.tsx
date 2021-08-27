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
import debug from 'debug'
import { useStageSelector } from 'api/redux/useStageSelector'
import { useConnection } from '../ConnectionService'
import { PeerConnection } from './PeerConnection'

const report = debug('WebRTCService')
const logger = {
    trace: report,
    error: report.extend('error'),
}
type TrackList = MediaStreamTrack[]
type DispatchTrackList = React.Dispatch<React.SetStateAction<TrackList>>
type StageDeviceTrackList = { [stageDeviceId: string]: TrackList }
type DispatchStageDeviceTrackList = React.Dispatch<React.SetStateAction<StageDeviceTrackList>>

const RemoteVideoTracksContext = React.createContext<StageDeviceTrackList>(undefined)
const DispatchRemoteVideoTracksContext =
    React.createContext<DispatchStageDeviceTrackList>(undefined)
const LocalVideoTracksContext = React.createContext<TrackList>(undefined)
const DispatchLocalVideoTracksContext = React.createContext<DispatchTrackList>(undefined)
const WebRTCProvider = ({ children }: { children: React.ReactNode }) => {
    const [localVideoTracks, setLocalVideoTracks] = React.useState<TrackList>([])
    const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<StageDeviceTrackList>({})

    report('local', localVideoTracks)
    report('remote', remoteVideoTracks)

    return (
        <DispatchLocalVideoTracksContext.Provider value={setLocalVideoTracks}>
            <LocalVideoTracksContext.Provider value={localVideoTracks}>
                <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
                    <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
                        {children}
                    </RemoteVideoTracksContext.Provider>
                </DispatchRemoteVideoTracksContext.Provider>
            </LocalVideoTracksContext.Provider>
        </DispatchLocalVideoTracksContext.Provider>
    )
}
const useLocalVideoTracks = (): TrackList => {
    const state = React.useContext(LocalVideoTracksContext)
    if (state === undefined)
        throw new Error('useLocalVideoTracks must be used within a WebRTCProvider')
    return state
}
const useRemoteVideoTracks = (): StageDeviceTrackList => {
    const state = React.useContext(RemoteVideoTracksContext)
    if (state === undefined)
        throw new Error('useRemoteVideoTracks must be used within a WebRTCProvider')
    return state
}

const WebRTCService = (): JSX.Element => {
    report('RERENDER')
    const connection = useConnection()
    const emit = connection ? connection.emit : undefined
    const [ready, setReady] = React.useState<boolean>(false)
    const localStageDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localStageDeviceId
    )
    const { inputVideoDeviceId, sendVideo, useP2P } = useStageSelector<{
        inputVideoDeviceId?: string
        sendVideo?: boolean
        useP2P?: boolean
    }>((state) => {
        if (state.globals.localDeviceId) {
            const localDevice = state.devices.byId[state.globals.localDeviceId] as BrowserDevice
            return {
                inputVideoDeviceId: localDevice.inputVideoDeviceId,
                sendVideo: localDevice.sendVideo,
                useP2P: localDevice.useP2P,
            }
        }
        return {}
    }, shallowEqual)
    const stageId = useStageSelector((state) => state.globals.stageId)
    const videoType = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId].videoType : undefined
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
                logger.trace(`Received offer from ${from}`)
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: offer,
                }))
            }
            const handleAnswer = ({ from, answer }: ServerDevicePayloads.P2PAnswerSent) => {
                logger.trace(`Received answer from ${from}`)
                setDescriptions((prev) => ({
                    ...prev,
                    [from]: answer,
                }))
            }
            const handleIceCandidate = ({
                from,
                iceCandidate,
            }: ServerDevicePayloads.IceCandidateSent) => {
                logger.trace(`Received ice candidate from ${from}`)
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
            logger.trace('Fetching video tracks')
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
                        emit(
                            ClientDeviceEvents.CreateVideoTrack,
                            {
                                stageId,
                                trackId: localStageDeviceId,
                                type: 'browser',
                            } as ClientDevicePayloads.CreateVideoTrack,
                            (error: string | null, videoTrack) => {
                                if (error) {
                                    logger.error(
                                        `Could not publish local video track. Reason: ${error}`
                                    )
                                } else {
                                    logger.trace('Published local video track')
                                    publishedIds.push(videoTrack._id)
                                    setLocalVideoTracks((prev) => [...prev, track])
                                }
                            }
                        )
                    })
                }
            })
            return () => {
                logger.trace('Cleaning up video tracks')
                abort = true
                publishedIds.map((publishedId) => {
                    emit(
                        ClientDeviceEvents.RemoveVideoTrack,
                        publishedId as ClientDevicePayloads.RemoveVideoTrack,
                        (error: string | null) => {
                            if (error) {
                                logger.error(
                                    `Could not UNpublish local video track. Reason: ${error}`
                                )
                            } else {
                                logger.trace('UNpublished local video track')
                            }
                        }
                    )
                })
                if (addedTracks) {
                    addedTracks.map((track) => {
                        logger.trace('Stopping track')
                        track.stop()
                        setLocalVideoTracks((prev) => prev.filter((t) => t.id !== track.id))
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
    const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
    const onRemoteTrack = React.useCallback(
        (stageDeviceId: string, track: MediaStreamTrack) => {
            report('ADDING REMOTE TRACK ' + track.id)
            setRemoteVideoTracks((prev) => ({
                ...prev,
                [stageDeviceId]: prev[stageDeviceId] ? [...prev[stageDeviceId], track] : [track],
            }))
            const endTrack = () => {
                report('REMOTE TRACK ENDED')
                setRemoteVideoTracks((prev) => ({
                    ...prev,
                    [stageDeviceId]: prev[stageDeviceId].filter((curr) => curr.id !== track.id),
                }))
            }
            track.onmute = endTrack
            track.onended = endTrack
        },
        [setRemoteVideoTracks]
    )
    const localVideoTracks = React.useContext(LocalVideoTracksContext)
    if (ready) {
        return (
            <>
                {stageDeviceIds.map((stageDeviceId) => (
                    <PeerConnection
                        key={stageDeviceId}
                        stageDeviceId={stageDeviceId}
                        onRemoteTrack={onRemoteTrack}
                        tracks={localVideoTracks}
                        currentDescription={descriptions[stageDeviceId]}
                        currentCandidate={candidates[stageDeviceId]}
                    />
                ))}
            </>
        )
    }
    return null
}
export { WebRTCService, WebRTCProvider, useLocalVideoTracks, useRemoteVideoTracks }

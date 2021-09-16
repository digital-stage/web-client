import {useStageSelector} from "../redux/selectors/useStageSelector";
import {useVideoConsumers} from "../services/MediasoupService";
import {useWebRTCRemoteVideos} from "../services/WebRTCService";
import React from "react";

const useRemoteVideos = (stageMemberId: string): MediaStreamTrack[] => {
    const webRTCVideos = useWebRTCRemoteVideos()
    const stageDeviceIds = useStageSelector(state => state.stageDevices.byStageMember[stageMemberId] || [])
    const videoTrackIds = useStageSelector(state => state.videoTracks.byStageMember[stageMemberId] || [])
    const mediasoupVideoConsumers = useVideoConsumers()
    return React.useMemo<MediaStreamTrack[]>(() => {
        return [
            ...stageDeviceIds.reduce((prev, stageDeviceId) => {
                if (webRTCVideos[stageDeviceId]) {
                    return [...prev, webRTCVideos[stageDeviceId]]
                }
                return prev
            }, []),
            ...videoTrackIds.reduce((prev, videoTrackId) => {
                if (mediasoupVideoConsumers[videoTrackId]) {
                    return [...prev, mediasoupVideoConsumers[videoTrackId].track]
                }
                return prev
            }, [])
        ]
    }, [mediasoupVideoConsumers, stageDeviceIds, videoTrackIds, webRTCVideos])
}

export {useRemoteVideos}
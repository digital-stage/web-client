import {useStageSelector} from "../redux/selectors/useStageSelector";
import {useAudioConsumers} from "../services/MediasoupService";
import {useWebRTCRemoteAudioTracks} from "../services/WebRTCService";
import React from "react";

export type RemoteAudioTracks = {
    [audioTrackId: string]: MediaStreamTrack
}

const useRemoteAudioTracks = (stageDeviceId: string): RemoteAudioTracks => {
    // There should be only one audio track for each webrtc or mediasoup per stage device
    const webRTCAudioTrackId = useStageSelector(state => state.audioTracks
        .byStageDevice[stageDeviceId]?.find(id => state.audioTracks.byId[id].type === "browser"))
    const mediasoupAudioTrackId = useStageSelector(state => state.audioTracks
        .byStageDevice[stageDeviceId]?.find(id => state.audioTracks.byId[id].type === "mediasoup"))

    const webRTCAudioTracks = useWebRTCRemoteAudioTracks()
    const mediasoupAudioConsumers = useAudioConsumers()

    return React.useMemo(() => {
        let tracks = {}
        if(webRTCAudioTracks[stageDeviceId]) {
            if(webRTCAudioTrackId) {
                tracks = {
                    ...tracks,
                    [webRTCAudioTrackId]: webRTCAudioTracks[stageDeviceId]
                }
            } else {
                console.error("Could not find audio track model for WebRTC audio track " + webRTCAudioTracks[stageDeviceId].id)
            }
        }
        if(mediasoupAudioConsumers[mediasoupAudioTrackId]) {
            tracks = {
                ...tracks,
                [mediasoupAudioTrackId]: mediasoupAudioConsumers[mediasoupAudioTrackId].track
            }
        }
        return tracks
    }, [mediasoupAudioConsumers, mediasoupAudioTrackId, stageDeviceId, webRTCAudioTrackId, webRTCAudioTracks])
}

export {useRemoteAudioTracks}
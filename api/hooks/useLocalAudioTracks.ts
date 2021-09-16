import { useMicrophone } from "../provider/MicrophoneProvider";
import { useStageSelector } from "../redux/selectors/useStageSelector";
import React from "react";


const useLocalAudioTracks = (): {
    [audioTrackId: string]: MediaStreamTrack
} => {
    const track = useMicrophone()
    const audioTrackId = useStageSelector(state => state.audioTracks.byStageDevice[state.globals.localStageDeviceId]?.find(
        id => state.audioTracks.byId[id].type === "browser" || state.audioTracks.byId[id].type === "mediasoup"
    ))

    return React.useMemo(() => {
        if(track && audioTrackId) {
            return {
                [audioTrackId]: track
            }
        }
        return {}
    }, [audioTrackId, track])
}
export {useLocalAudioTracks}
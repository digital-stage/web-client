import { useEffect, useState } from 'react'
import {  DefaultVolumeProperties,
     VolumeProperties,
} from '@digitalstage/api-types'
import { useStageSelector } from 'api/redux/selectors/useStageSelector'
import {useStageDeviceVolume} from "./useStageDeviceVolume";

const useAudioTrackVolume = ({
                                 audioTrackId,
                                   deviceId,
                               }: {
    audioTrackId: string
    deviceId: string
}): VolumeProperties => {
    const [state, setState] = useState<VolumeProperties>(
        DefaultVolumeProperties
    )
    // Fetch necessary model
    const audioTrackVolume = useStageSelector<number | undefined>(
        (state) =>
            state.audioTracks.byId[audioTrackId] &&
            state.audioTracks.byId[audioTrackId].volume
    )
    const audioTrackMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.audioTracks.byId[audioTrackId] &&
            state.audioTracks.byId[audioTrackId].muted
    )

    const customAudioTrackVolume = useStageSelector<number | undefined>(
        (state) =>
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId] &&
            state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][
                    audioTrackId
                    ]
                ].volume
    )
    const customAudioTrackMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId] &&
            state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][
                    audioTrackId
                    ]
                ].muted
    )
    const stageDeviceId = useStageSelector(state => state.audioTracks.byId[audioTrackId].stageDeviceId)
    const {volume: stageDeviceVolume, muted: stageDeviceMuted} = useStageDeviceVolume({
        stageDeviceId: stageDeviceId,
        deviceId,
    })

    // Calculate actual volume
    useEffect(() => {
        if(audioTrackVolume && stageDeviceVolume) {
            setState({
                volume: (customAudioTrackVolume || audioTrackVolume) * stageDeviceVolume,
                muted: (customAudioTrackMuted ? customAudioTrackMuted :  audioTrackMuted) || stageDeviceMuted
            })
        }
    }, [audioTrackMuted, audioTrackVolume, customAudioTrackMuted, customAudioTrackVolume, stageDeviceMuted, stageDeviceVolume])

    return state
}
export { useAudioTrackVolume }

/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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

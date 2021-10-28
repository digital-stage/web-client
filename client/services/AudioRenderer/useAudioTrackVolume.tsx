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

import {useEffect, useState} from 'react'
import {
  DefaultVolumeProperties,
  VolumeProperties,
} from '@digitalstage/api-types'
import {
  RootState,
  useTrackedSelector
} from "../..";
import {useStageDeviceVolume} from "./useStageDeviceVolume";

const selectCustomAudioTrackVolumeByDeviceIdAndAudioTrackId = (state: RootState, deviceId: string, audioTrackId: string) =>
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId] ?
    state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][
        audioTrackId
        ]
      ].volume : undefined

const selectCustomAudioTrackMuteByDeviceIdAndAudioTrackId = (state: RootState, deviceId: string, audioTrackId: string) =>
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId] ?
    state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][
        audioTrackId
        ]
      ].muted : undefined

const useAudioTrackVolume = ({
                               audioTrackId,
                               deviceId,
                             }: {
  audioTrackId: string
  deviceId: string
}): VolumeProperties => {
  const [volume, setVolume] = useState<VolumeProperties>(
    DefaultVolumeProperties
  )
  // Fetch necessary model
  const state = useTrackedSelector()
  const audioTrackVolume = state.audioTracks.byId[audioTrackId] &&
    state.audioTracks.byId[audioTrackId].volume
  const audioTrackMuted = state.audioTracks.byId[audioTrackId] &&
    state.audioTracks.byId[audioTrackId].muted

  const customAudioTrackVolume = selectCustomAudioTrackVolumeByDeviceIdAndAudioTrackId(state, deviceId, audioTrackId)
  const customAudioTrackMuted = selectCustomAudioTrackMuteByDeviceIdAndAudioTrackId(state, deviceId, audioTrackId)
  const {stageDeviceId} = state.audioTracks.byId[audioTrackId]
  const {volume: stageDeviceVolume, muted: stageDeviceMuted} = useStageDeviceVolume({
    stageDeviceId,
    deviceId,
  })

  // Calculate actual volume
  useEffect(() => {
    if (audioTrackVolume && stageDeviceVolume) {
      setVolume({
        volume: (customAudioTrackVolume || audioTrackVolume) * stageDeviceVolume,
        muted: (customAudioTrackMuted || audioTrackMuted) || stageDeviceMuted
      })
    }
  }, [audioTrackMuted, audioTrackVolume, customAudioTrackMuted, customAudioTrackVolume, stageDeviceMuted, stageDeviceVolume])

  return volume
}
export {useAudioTrackVolume}

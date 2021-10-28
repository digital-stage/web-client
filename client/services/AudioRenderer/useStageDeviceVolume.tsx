/* eslint-disable @typescript-eslint/no-unused-vars */
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

import React from 'react'
import {
  DefaultVolumeProperties, VolumeProperties,
} from '@digitalstage/api-types'
import {useTrackedSelector} from "../..";


const useStageDeviceVolume = ({
                                stageDeviceId,
                                deviceId,
                              }: {
  stageDeviceId: string
  deviceId: string
}): VolumeProperties => {
  const [volume, setVolume] = React.useState<VolumeProperties>(DefaultVolumeProperties)
  // Fetch necessary model

  const state = useTrackedSelector()
  const stageDeviceVolume = state.stageDevices.byId[stageDeviceId] &&
    state.stageDevices.byId[stageDeviceId].volume
  const stageDeviceMuted = state.stageDevices.byId[stageDeviceId] &&
    state.stageDevices.byId[stageDeviceId].muted
  const customStageDeviceVolume = state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId] ?
    state.customStageDeviceVolumes.byId[
      state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][
        stageDeviceId
        ]
      ].volume : undefined
  const customStageDeviceMuted = state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId] ?
    state.customStageDeviceVolumes.byId[
      state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][
        stageDeviceId
        ]
      ].muted : undefined
  const stageMemberVolume = state.stageDevices.byId[stageDeviceId] && state.stageMembers.byId[state.stageDevices.byId[stageDeviceId].stageMemberId].volume
  const stageMemberMuted = state.stageDevices.byId[stageDeviceId] && state.stageMembers.byId[state.stageDevices.byId[stageDeviceId].stageMemberId].muted
  const customStageMemberVolume =
    state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
    state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageDeviceId] ?
      state.customStageMemberVolumes.byId[
        state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][
          stageDeviceId
          ]
        ].volume : undefined
  const customStageMemberMuted =
    state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
    state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageDeviceId] ?
      state.customStageMemberVolumes.byId[
        state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][
          stageDeviceId
          ]
        ].muted : undefined
  const groupVolume = state.stageDevices.byId[stageDeviceId].groupId ? state.groups.byId[state.stageDevices.byId[stageDeviceId].groupId].volume : undefined
  const groupMuted = state.stageDevices.byId[stageDeviceId].groupId ? state.groups.byId[state.stageDevices.byId[stageDeviceId].groupId].muted : undefined
  const customGroupVolume =
    state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
    state.customGroupVolumes.byDeviceAndGroup[deviceId][stageDeviceId] ?
      state.customGroupVolumes.byId[
        state.customGroupVolumes.byDeviceAndGroup[deviceId][
          stageDeviceId
          ]
        ].volume : undefined
  const customGroupMuted =
    state.stageDevices.byId[stageDeviceId]?.groupId &&
    state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
    state.customGroupVolumes.byDeviceAndGroup[deviceId][state.stageDevices.byId[stageDeviceId].groupId] ?
      state.customGroupVolumes.byId[
        state.customGroupVolumes.byDeviceAndGroup[deviceId][state.stageDevices.byId[stageDeviceId].groupId]].muted : undefined

  // Calculate position
  React.useEffect(() => {
    if (groupVolume && stageMemberVolume && stageDeviceVolume) {
      setVolume({
        volume: groupVolume * stageMemberVolume * stageDeviceVolume,
        muted: (groupMuted || stageMemberMuted || stageDeviceMuted) || false
      })
    }
  }, [groupMuted, groupVolume, stageDeviceMuted, stageDeviceVolume, stageMemberMuted, stageMemberVolume])

  return volume
}
export {useStageDeviceVolume}

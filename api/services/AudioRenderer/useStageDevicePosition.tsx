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
  DefaultThreeDimensionalProperties, StageMember,
  ThreeDimensionalProperties,
} from '@digitalstage/api-types'
import {RootState, selectStageDeviceById, useTrackedSelector} from "@digitalstage/api-client-react";

const selectStageMemberByStageDeviceId = (state: RootState, stageDeviceId: string): StageMember => state.stageMembers.byId[state.stageDevices.byId[stageDeviceId].stageMemberId]

const useStageDevicePosition = ({
                                  stageDeviceId,
                                  deviceId,
                                }: {
  stageDeviceId: string
  deviceId: string
}): ThreeDimensionalProperties => {
  const [position, setPosition] = useState<ThreeDimensionalProperties>(
    DefaultThreeDimensionalProperties
  )
  // Fetch necessary model
  const state = useTrackedSelector()
  const stageDevice = selectStageDeviceById(state, stageDeviceId)
  const customStageDevicePosition = state.customStageDevicePositions.byDeviceAndStageDevice[deviceId] &&
  state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDeviceId]
    ? state.customStageDevicePositions.byId[
      state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][
        stageDeviceId
        ]
      ]
    : undefined
  const stageMember = selectStageMemberByStageDeviceId(state, stageDeviceId)
  const customStageMemberPosition = stageMember &&
  state.customStageMemberPositions.byDeviceAndStageMember[deviceId] &&
  state.customStageMemberPositions.byDeviceAndStageMember[deviceId][stageMember._id]
    ? state.customStageMemberPositions.byId[
      state.customStageMemberPositions.byDeviceAndStageMember[deviceId][
        stageMember._id
        ]
      ]
    : undefined
  const group = state.groups.byId[stageMember.groupId]
  const customGroupPosition = group &&
  state.customGroupPositions.byDeviceAndGroup[deviceId] &&
  state.customGroupPositions.byDeviceAndGroup[deviceId][group._id]
    ? state.customGroupPositions.byId[
      state.customGroupPositions.byDeviceAndGroup[deviceId][group._id]
      ]
    : undefined

  // Calculate position
  useEffect(() => {
    // Only calculate if ready and the default entities are available
    if (group && stageMember && stageDevice) {
      setPosition({
        x:
          (customGroupPosition?.x || group.x) +
          (customStageMemberPosition?.x || stageMember.x) +
          (customStageDevicePosition?.x || stageDevice.x),
        y:
          (customGroupPosition?.y || group.y) +
          (customStageMemberPosition?.y || stageMember.y) +
          (customStageDevicePosition?.y || stageDevice.y),
        z:
          (customGroupPosition?.z || group.z) +
          (customStageMemberPosition?.z || stageMember.z) +
          (customStageDevicePosition?.z || stageDevice.z),
        rX:
          (customGroupPosition?.rX || group.rX) +
          (customStageMemberPosition?.rX || stageMember.rX) +
          (customStageDevicePosition?.rX || stageDevice.rX),
        rY:
          (customGroupPosition?.rY || group.rY) +
          (customStageMemberPosition?.rY || stageMember.rY) +
          (customStageDevicePosition?.rY || stageDevice.rY),
        rZ:
          (customGroupPosition?.rZ || group.rZ) +
          (customStageMemberPosition?.rZ || stageMember.rZ) +
          (customStageDevicePosition?.rZ || stageDevice.rZ),
        directivity: customGroupPosition?.directivity || group.directivity,
      })
    }
  }, [
    group,
    customGroupPosition,
    stageMember,
    customStageMemberPosition,
    stageDevice,
    customStageDevicePosition,
  ])

  return position
}
export {useStageDevicePosition}

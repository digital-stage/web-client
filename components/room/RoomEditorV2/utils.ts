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

import {RootState, useStageSelector} from "@digitalstage/api-client-react";
import {shallowEqual} from "react-redux";

const selectGroupPosition = (groupId: string, state: RootState) => ({
  x: state.groups.byId[groupId].x,
  y: state.groups.byId[groupId].y,
  rZ: state.groups.byId[groupId].rZ,
})
const useGroupPosition = (groupId: string) => useStageSelector<{ x: number, y: number, rZ: number }>(state => selectGroupPosition(groupId, state), shallowEqual)
const selectCustomGroupPosition = (groupId: string, state: RootState) => {
  const customGroupId = state.globals.selectedMode === "personal" &&
    state.customGroupPositions.byDeviceAndGroup[state.globals.selectedDeviceId] &&
    state.customGroupPositions.byDeviceAndGroup[state.globals.selectedDeviceId][groupId]
  if (customGroupId) {
    return {
      x: state.customGroupPositions.byId[customGroupId].x,
      y: state.customGroupPositions.byId[customGroupId].y,
      rZ: state.customGroupPositions.byId[customGroupId].rZ,
      _id: state.customGroupPositions.byId[customGroupId]._id,
    }
  }
  return undefined
}
const useCustomGroupPosition = (groupId: string) => useStageSelector<{ x: number, y: number, rZ: number, _id: string } | undefined>(state => selectCustomGroupPosition(groupId, state), shallowEqual)
const selectResultingGroupPosition = (groupId, state: RootState) => {
  const customPosition = selectCustomGroupPosition(groupId, state)
  if (customPosition)
    return customPosition
  return selectGroupPosition(groupId, state)
}

const selectStageMemberPosition = (stageMemberId: string, state: RootState) => ({
  x: state.stageMembers.byId[stageMemberId].x,
  y: state.stageMembers.byId[stageMemberId].y,
  rZ: state.stageMembers.byId[stageMemberId].rZ,
})
const useStageMemberPosition = (stageMemberId: string) => useStageSelector<{ x: number, y: number, rZ: number }>(state => selectStageMemberPosition(stageMemberId, state), shallowEqual)
const selectCustomStageMemberPosition = (stageMemberId: string, state: RootState) => {
  const customStageMemberId = state.globals.selectedMode === "personal" &&
    state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId] &&
    state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]
  if (customStageMemberId) {
    return {
      x: state.customStageMemberPositions.byId[customStageMemberId].x,
      y: state.customStageMemberPositions.byId[customStageMemberId].y,
      rZ: state.customStageMemberPositions.byId[customStageMemberId].rZ,
      _id: customStageMemberId
    }
  }
  return undefined
}
const useCustomStageMemberPosition = (stageMemberId: string) => useStageSelector<{ x: number, y: number, rZ: number, _id: string } | undefined>(state => selectCustomStageMemberPosition(stageMemberId, state), shallowEqual)
const selectResultingStageMemberPosition = (stageMemberId: string, state: RootState) => {
  const customPosition = selectCustomStageMemberPosition(stageMemberId, state)
  if (customPosition)
    return customPosition
  return selectStageMemberPosition(stageMemberId, state)
}

const selectStageDevicePosition = (stageDeviceId: string, state: RootState) => ({
  x: state.stageDevices.byId[stageDeviceId].x,
  y: state.stageDevices.byId[stageDeviceId].y,
  rZ: state.stageDevices.byId[stageDeviceId].rZ,
})
const useStageDevicePosition = (stageDeviceId: string) => useStageSelector<{ x: number, y: number, rZ: number }>(state => selectStageDevicePosition(stageDeviceId, state), shallowEqual)
const selectCustomStageDevicePosition = (stageDeviceId: string, state: RootState) => {
  const customStageDeviceId = state.globals.selectedMode === "personal" &&
    state.customStageDevicePositions.byDeviceAndStageDevice[state.globals.selectedDeviceId] &&
    state.customStageDevicePositions.byDeviceAndStageDevice[state.globals.selectedDeviceId][stageDeviceId]
  if (customStageDeviceId) {
    return {
      x: state.customStageDevicePositions.byId[customStageDeviceId].x,
      y: state.customStageDevicePositions.byId[customStageDeviceId].y,
      rZ: state.customStageDevicePositions.byId[customStageDeviceId].rZ,
      _id: customStageDeviceId
    }
  }
  return undefined
}
const useCustomStageDevicePosition = (stageDeviceId: string) => useStageSelector<{ x: number, y: number, rZ: number } | undefined>(state => selectCustomStageDevicePosition(stageDeviceId, state), shallowEqual)
const selectResultingStageDevicePosition = (stageDeviceId: string, state: RootState) => {
  const customPosition = selectCustomStageDevicePosition(stageDeviceId, state)
  if (customPosition)
    return customPosition
  return selectStageDevicePosition(stageDeviceId, state)
}

const selectAudioTrackPosition = (audioTrackId: string, state: RootState) => ({
  x: state.audioTracks.byId[audioTrackId].x,
  y: state.audioTracks.byId[audioTrackId].y,
  rZ: state.audioTracks.byId[audioTrackId].rZ,
})
const useAudioTrackPosition = (audioTrackId: string) => useStageSelector<{ x: number, y: number, rZ: number }>(state => selectAudioTrackPosition(audioTrackId, state), shallowEqual)
const selectCustomAudioTrackPosition = (audioTrackId: string, state: RootState) => {
  const customAudioTrackId = state.globals.selectedMode === "personal" &&
    state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId] &&
    state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]
  if (customAudioTrackId) {
    return {
      x: state.customAudioTrackPositions.byId[customAudioTrackId].x,
      y: state.customAudioTrackPositions.byId[customAudioTrackId].y,
      rZ: state.customAudioTrackPositions.byId[customAudioTrackId].rZ
    }
  }
  return undefined
}
const useCustomAudioTrackPosition = (audioTrackId: string) => useStageSelector<{ x: number, y: number, rZ: number } | undefined>(state => selectCustomAudioTrackPosition(audioTrackId, state), shallowEqual)

const useListenerPosition = () => {
  const groupPosition = useStageSelector<{ x: number, y: number, rZ: number }>(state =>
      selectResultingGroupPosition(state.globals.groupId, state), shallowEqual)
  const stageMemberPosition = useStageSelector<{ x: number, y: number, rZ: number }>(state =>
      selectResultingStageMemberPosition(state.globals.stageMemberId, state), shallowEqual)
  const stageDevicePosition = useStageSelector<{ x: number, y: number, rZ: number }>(state =>
      selectResultingStageDevicePosition(state.globals.localStageDeviceId, state), shallowEqual)
  return ({
    x: groupPosition.x + stageMemberPosition.x + stageDevicePosition.x,
    y: groupPosition.y + stageMemberPosition.y + stageDevicePosition.y,
    rZ: groupPosition.rZ + stageMemberPosition.rZ + stageDevicePosition.rZ
  })
}

export {
  selectAudioTrackPosition,
  selectCustomAudioTrackPosition,
  selectCustomGroupPosition,
  selectResultingGroupPosition,
  selectCustomStageMemberPosition,
  selectGroupPosition,
  selectCustomStageDevicePosition,
  selectResultingStageMemberPosition,
  selectResultingStageDevicePosition,
  selectStageDevicePosition,
  selectStageMemberPosition,
  useGroupPosition,
  useCustomGroupPosition,
  useStageMemberPosition,
  useCustomStageMemberPosition,
  useStageDevicePosition,
  useCustomStageDevicePosition,
  useAudioTrackPosition,
  useCustomAudioTrackPosition,
    useListenerPosition
}
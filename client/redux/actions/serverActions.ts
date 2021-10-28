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

import { Device, ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { ReducerAction } from './ReducerAction'

const messageSent = (message: ServerDevicePayloads.ChatMessageSend): ReducerAction => ({
    type: ServerDeviceEvents.ChatMessageSend,
    payload: message,
})

const addUser = (user: ServerDevicePayloads.UserAdded): ReducerAction => ({
    type: ServerDeviceEvents.UserAdded,
    payload: user,
})
const changeUser = (user: ServerDevicePayloads.UserChanged): ReducerAction => ({
    type: ServerDeviceEvents.UserChanged,
    payload: user,
})
const removeUser = (userId: ServerDevicePayloads.UserRemoved): ReducerAction => ({
    type: ServerDeviceEvents.UserRemoved,
    payload: userId,
})
const addStage = (stage: ServerDevicePayloads.StageAdded): ReducerAction => ({
    type: ServerDeviceEvents.StageAdded,
    payload: stage,
})
const changeStage = (stage: ServerDevicePayloads.StageChanged): ReducerAction => ({
    type: ServerDeviceEvents.StageChanged,
    payload: stage,
})
const removeStage = (stageId: ServerDevicePayloads.StageRemoved): ReducerAction => ({
    type: ServerDeviceEvents.StageRemoved,
    payload: stageId,
})

const addGroup = (group: ServerDevicePayloads.GroupAdded): ReducerAction => ({
    type: ServerDeviceEvents.GroupAdded,
    payload: group,
})
const changeGroup = (group: ServerDevicePayloads.GroupChanged): ReducerAction => ({
    type: ServerDeviceEvents.GroupChanged,
    payload: group,
})
const removeGroup = (groupId: ServerDevicePayloads.GroupRemoved): ReducerAction => ({
    type: ServerDeviceEvents.GroupRemoved,
    payload: groupId,
})

const addCustomGroupVolume = (
    group: ServerDevicePayloads.CustomGroupVolumeAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupVolumeAdded,
    payload: group,
})
const changeCustomGroupVolume = (
    group: ServerDevicePayloads.CustomGroupVolumeChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupVolumeChanged,
    payload: group,
})
const removeCustomGroupVolume = (
    groupId: ServerDevicePayloads.CustomGroupVolumeRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupVolumeRemoved,
    payload: groupId,
})
const addCustomGroupPosition = (
    group: ServerDevicePayloads.CustomGroupPositionAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupPositionAdded,
    payload: group,
})
const changeCustomGroupPosition = (
    group: ServerDevicePayloads.CustomGroupPositionChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupPositionChanged,
    payload: group,
})
const removeCustomGroupPosition = (
    groupId: ServerDevicePayloads.CustomGroupPositionRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomGroupPositionRemoved,
    payload: groupId,
})

const addStageMember = (stageMember: ServerDevicePayloads.StageMemberAdded): ReducerAction => ({
    type: ServerDeviceEvents.StageMemberAdded,
    payload: stageMember,
})
const changeStageMember = (
    stageMember: ServerDevicePayloads.StageMemberChanged
): ReducerAction => ({
    type: ServerDeviceEvents.StageMemberChanged,
    payload: stageMember,
})
const removeStageMember = (
    stageMemberId: ServerDevicePayloads.StageMemberRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.StageMemberRemoved,
    payload: stageMemberId,
})

const addCustomStageMemberVolume = (
    stageMember: ServerDevicePayloads.CustomStageMemberVolumeAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberVolumeAdded,
    payload: stageMember,
})
const changeCustomStageMemberVolume = (
    stageMember: ServerDevicePayloads.CustomStageMemberVolumeChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberVolumeChanged,
    payload: stageMember,
})
const removeCustomStageMemberVolume = (
    customStageMemberId: ServerDevicePayloads.CustomStageMemberVolumeRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberVolumeRemoved,
    payload: customStageMemberId,
})
const addCustomStageMemberPosition = (
    stageMember: ServerDevicePayloads.CustomStageMemberPositionAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberPositionAdded,
    payload: stageMember,
})
const changeCustomStageMemberPosition = (
    stageMember: ServerDevicePayloads.CustomStageMemberPositionChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberPositionChanged,
    payload: stageMember,
})
const removeCustomStageMemberPosition = (
    customStageMemberId: ServerDevicePayloads.CustomStageMemberPositionRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageMemberPositionRemoved,
    payload: customStageMemberId,
})

const addStageDevice = (stageDevice: ServerDevicePayloads.StageDeviceAdded): ReducerAction => ({
    type: ServerDeviceEvents.StageDeviceAdded,
    payload: stageDevice,
})
const changeStageDevice = (
    stageDevice: ServerDevicePayloads.StageDeviceChanged
): ReducerAction => ({
    type: ServerDeviceEvents.StageDeviceChanged,
    payload: stageDevice,
})
const removeStageDevice = (
    stageDeviceId: ServerDevicePayloads.StageDeviceRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.StageDeviceRemoved,
    payload: stageDeviceId,
})

const addCustomStageDeviceVolume = (
    stageDevice: ServerDevicePayloads.CustomStageDeviceVolumeAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDeviceVolumeAdded,
    payload: stageDevice,
})
const changeCustomStageDeviceVolume = (
    stageDevice: ServerDevicePayloads.CustomStageDeviceVolumeChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDeviceVolumeChanged,
    payload: stageDevice,
})
const removeCustomStageDeviceVolume = (
    customStageDeviceId: ServerDevicePayloads.CustomStageDeviceVolumeRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDeviceVolumeRemoved,
    payload: customStageDeviceId,
})
const addCustomStageDevicePosition = (
    stageDevice: ServerDevicePayloads.CustomStageDevicePositionAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDevicePositionAdded,
    payload: stageDevice,
})
const changeCustomStageDevicePosition = (
    stageDevice: ServerDevicePayloads.CustomStageDevicePositionChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDevicePositionChanged,
    payload: stageDevice,
})
const removeCustomStageDevicePosition = (
    customStageDeviceId: ServerDevicePayloads.CustomStageDevicePositionRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomStageDevicePositionRemoved,
    payload: customStageDeviceId,
})

const addVideoTrack = (videoTrack: ServerDevicePayloads.VideoTrackAdded): ReducerAction => ({
    type: ServerDeviceEvents.VideoTrackAdded,
    payload: videoTrack,
})
const changeVideoTrack = (videoTrack: ServerDevicePayloads.VideoTrackChanged): ReducerAction => ({
    type: ServerDeviceEvents.VideoTrackChanged,
    payload: videoTrack,
})
const removeVideoTrack = (videoTrackId: ServerDevicePayloads.VideoTrackRemoved): ReducerAction => ({
    type: ServerDeviceEvents.VideoTrackRemoved,
    payload: videoTrackId,
})

const addAudioTrack = (audioTrack: ServerDevicePayloads.AudioTrackAdded): ReducerAction => ({
    type: ServerDeviceEvents.AudioTrackAdded,
    payload: audioTrack,
})
const changeAudioTrack = (audioTrack: ServerDevicePayloads.AudioTrackChanged): ReducerAction => ({
    type: ServerDeviceEvents.AudioTrackChanged,
    payload: audioTrack,
})
const removeAudioTrack = (audioTrackId: ServerDevicePayloads.AudioTrackRemoved): ReducerAction => ({
    type: ServerDeviceEvents.AudioTrackRemoved,
    payload: audioTrackId,
})

const addCustomAudioTrackVolume = (
    customAudioTrackVolume: ServerDevicePayloads.CustomAudioTrackVolumeAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackVolumeAdded,
    payload: customAudioTrackVolume,
})
const changeCustomAudioTrackVolume = (
    customAudioTrackVolume: ServerDevicePayloads.CustomAudioTrackVolumeChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackVolumeChanged,
    payload: customAudioTrackVolume,
})
const removeCustomAudioTrackVolume = (
    customAudioTrackVolumeId: ServerDevicePayloads.CustomAudioTrackVolumeRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackVolumeRemoved,
    payload: customAudioTrackVolumeId,
})
const addCustomAudioTrackPosition = (
    customAudioTrackPosition: ServerDevicePayloads.CustomAudioTrackPositionAdded
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackPositionAdded,
    payload: customAudioTrackPosition,
})
const changeCustomAudioTrackPosition = (
    customAudioTrackPosition: ServerDevicePayloads.CustomAudioTrackPositionChanged
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackPositionChanged,
    payload: customAudioTrackPosition,
})
const removeCustomAudioTrackPosition = (
    customAudioTrackPositionId: ServerDevicePayloads.CustomAudioTrackPositionRemoved
): ReducerAction => ({
    type: ServerDeviceEvents.CustomAudioTrackPositionRemoved,
    payload: customAudioTrackPositionId,
})

const userReady = (user: ServerDevicePayloads.UserReady): ReducerAction => ({
    type: ServerDeviceEvents.UserReady,
    payload: user,
})
const ready = (payload: ServerDevicePayloads.Ready): ReducerAction => ({
    type: ServerDeviceEvents.Ready,
    payload
})

const stageJoined = (payload: ServerDevicePayloads.StageJoined): ReducerAction => ({
    type: ServerDeviceEvents.StageJoined,
    payload,
})
const stageLeft = (): ReducerAction => ({
    type: ServerDeviceEvents.StageLeft,
})

const localDeviceReady = (device: Device): ReducerAction => ({
    type: ServerDeviceEvents.LocalDeviceReady,
    payload: device,
})

const addDevice = (device: Device): ReducerAction => ({
    type: ServerDeviceEvents.DeviceAdded,
    payload: device,
})
const changeDevice = (device: Partial<Device>): ReducerAction => ({
    type: ServerDeviceEvents.DeviceChanged,
    payload: device,
})
const removeDevice = (deviceId: string): ReducerAction => ({
    type: ServerDeviceEvents.DeviceRemoved,
    payload: deviceId,
})

const serverActions = {
    localDeviceReady,
    addDevice,
    changeDevice,
    removeDevice,
    userReady,
    ready,
    stageJoined,
    stageLeft,
    messageSent,
    addUser,
    changeUser,
    removeUser,
    addStage,
    changeStage,
    removeStage,
    addGroup,
    changeGroup,
    removeGroup,
    addCustomGroupVolume,
    changeCustomGroupVolume,
    removeCustomGroupVolume,
    addCustomGroupPosition,
    changeCustomGroupPosition,
    removeCustomGroupPosition,
    addStageMember,
    changeStageMember,
    removeStageMember,
    addCustomStageMemberVolume,
    changeCustomStageMemberVolume,
    removeCustomStageMemberVolume,
    addCustomStageMemberPosition,
    changeCustomStageMemberPosition,
    removeCustomStageMemberPosition,
    addStageDevice,
    changeStageDevice,
    removeStageDevice,
    addCustomStageDeviceVolume,
    changeCustomStageDeviceVolume,
    removeCustomStageDeviceVolume,
    addCustomStageDevicePosition,
    changeCustomStageDevicePosition,
    removeCustomStageDevicePosition,
    addCustomAudioTrackPosition,
    changeCustomAudioTrackPosition,
    removeCustomAudioTrackPosition,
    addCustomAudioTrackVolume,
    changeCustomAudioTrackVolume,
    removeCustomAudioTrackVolume,
    addAudioTrack,
    changeAudioTrack,
    removeAudioTrack,
    addVideoTrack,
    changeVideoTrack,
    removeVideoTrack,
}
export { serverActions }

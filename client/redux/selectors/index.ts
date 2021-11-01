import {RootState} from "../..";
import {
  AudioTrack, CustomAudioTrackVolume,
  CustomGroupVolume, CustomStageDeviceVolume, CustomStageMemberVolume,
  DefaultThreeDimensionalProperties,
  Device,
  Group, SoundCard,
  Stage,
  StageDevice, StageMember,
  ThreeDimensionalProperties,
  User
} from "@digitalstage/api-types";
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";
import {AuthUser} from "../state/Auth";

// AUTH
export const selectSignedIn = (state: RootState): boolean => state.auth.initialized && !!state.auth.token
export const selectSignedOut = (state: RootState): boolean => state.auth.initialized && !state.auth.token
export const selectAuthUser = (state: RootState): AuthUser | undefined => state.auth.user
export const selectToken = (state: RootState): string | undefined => state.auth.token
export const selectEmail = (state: RootState): string | undefined => state.auth.user?.email

// GLOBALS
export const selectReady = (state: RootState): boolean => state.globals.ready
export const selectP2PEnabled = (state: RootState): boolean => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].useP2P : false
export const selectLocalUserId = (state: RootState): string | undefined => state.globals.localUserId
export const selectLocalUser = (state: RootState): User | undefined => state.globals.localUserId ? state.users.byId[state.globals.localUserId] : undefined
export const selectLocalDeviceId = (state: RootState): string | undefined => state.globals.localDeviceId
export const selectLocalStageDeviceId = (state: RootState): string | undefined => state.globals.localStageDeviceId
export const selectShowOffline = (state: RootState): boolean => state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline || false
export const selectSelectedDeviceId = (state: RootState): string | undefined => state.globals.selectedDeviceId
export const selectSelectedDevice = (state: RootState): Device | undefined => state.globals.selectedDeviceId ? state.devices.byId[state.globals.selectedDeviceId] : undefined
export const selectSelectMode = (state: RootState): "global" | "personal" => state.globals.selectedMode
export const selectStageDeviceIdOfSelectedDevice = (state: RootState): string | undefined => state.globals.stageId &&
state.globals.selectedDeviceId &&
state.stageDevices.byStageAndDevice[state.globals.stageId] &&
state.stageDevices.byStageAndDevice[state.globals.stageId][state.globals.selectedDeviceId]
  ? state.stageDevices.byStageAndDevice[state.globals.stageId][state.globals.selectedDeviceId]
  : undefined


// USER RELATED
export const selectUserByStageMemberId = (state: RootState, stageMemberId: string): User | undefined => state.stageMembers.byId[stageMemberId]?.userId ? state.users.byId[state.stageMembers.byId[stageMemberId]?.userId] : undefined
export const selectUserNameByStageMemberId = (state: RootState, stageMemberId: string): string => state.stageMembers.byId[stageMemberId]?.userId && state.users.byId[state.stageMembers.byId[stageMemberId]?.userId]?.name || stageMemberId


// STAGE RELATED
export const selectCurrentStageId = (state: RootState): string | undefined => state.globals.stageId
export const selectCurrentGroupId = (state: RootState): string | undefined => state.globals.stageId ? state.globals.groupId : undefined
export const selectCurrentStageMemberId = (state: RootState): string | undefined => state.globals.stageMemberId
export const selectIsCurrentlyAdmin = (state: RootState): boolean => state.globals.stageId && state.globals.localUserId
  ? state.stages.byId[state.globals.stageId].admins.some((id) => id === state.globals.localUserId)
  : false
export const selectCurrentAudioType = (state: RootState): string | undefined => state.globals.stageId && state.stages.byId[state.globals.stageId].audioType || undefined
export const selectCurrentVideoType = (state: RootState): string | undefined => state.globals.stageId && state.stages.byId[state.globals.stageId].videoType || undefined
export const selectCurrentStateRenderReverb = (state: RootState): boolean => state.globals.stageId && state.stages.byId[state.globals.stageId].renderReverb || false
export const selectTurnServers = (state: RootState): string[] => state.globals.turn?.urls || []
export const selectTurnUsername = (state: RootState): string | undefined => state.globals.turn?.username
export const selectTurnCredential = (state: RootState): string | undefined => state.globals.turn?.credential
export const selectAllStageIds = (state: RootState): string[] => state.stages.allIds
export const selectStageById = (state: RootState, id: string): Stage => state.stages.byId[id]
export const selectVideoTypeByStageId = (state: RootState, stageId: string): 'mediasoup' | 'jammer' | 'ov' => state.stages.byId[stageId].videoType as 'mediasoup' | 'jammer' | 'ov'
export const selectAudioTypeByStageId = (state: RootState, stageId: string): 'mediasoup' | 'jammer' | 'ov' => state.stages.byId[stageId].audioType as 'mediasoup' | 'jammer' | 'ov'

export const selectStageDeviceIdsByStageMemberIdAndFilter = (state: RootState, stageMemberId: string): string[] => {
  if (state.stageDevices.byStage[stageMemberId]) {
    if (state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline) {
      return state.stageDevices.byStage[stageMemberId]
    }
    return state.stageDevices.byStage[stageMemberId].filter(id => state.stageDevices.byId[id].active)
  }
  return []
}

// GROUP
export const selectGroupById = (state: RootState, id: string): Group => state.groups.byId[id]
export const selectGroupIdsByStageId = (state: RootState, stageId: string): string[] => state.groups.byStage[stageId] || []
export const selectGroupsByStageId = (state: RootState, stageId: string): Group[] => state.groups.byStage[stageId]?.map(id => state.groups.byId[id]) || []
export const selectCustomGroupVolumeByGroupId = (state: RootState, groupId: string): CustomGroupVolume | undefined =>
  state.globals.selectedDeviceId &&
  state.customGroupVolumes.byDeviceAndGroup[state.globals.selectedDeviceId] &&
  state.customGroupVolumes.byDeviceAndGroup[state.globals.selectedDeviceId][groupId]
    ? state.customGroupVolumes.byId[
      state.customGroupVolumes.byDeviceAndGroup[state.globals.selectedDeviceId][groupId]
      ]
    : undefined
export const selectGroupPositionByGroupId = (state: RootState, groupId: string): ThreeDimensionalProperties => {
  const position = state.groups.byId[groupId]
  if (position) {
    return ({
      x: position.x,
      y: position.y,
      z: position.z,
      rX: position.rX,
      rY: position.rY,
      rZ: position.rZ,
      directivity: position.directivity
    })
  }
  return DefaultThreeDimensionalProperties
}
export const selectCustomGroupPositionByGroupId = (state: RootState, groupId: string): ThreeDimensionalProperties & { _id: string } | undefined => {
  if (state.globals.selectedDeviceId && state.globals.selectedMode === "personal" && state.customGroupPositions.byDeviceAndGroup[state.globals.selectedDeviceId]) {
    const customPositionId = state.customGroupPositions.byDeviceAndGroup[state.globals.selectedDeviceId][groupId]
    if (customPositionId) {
      const customPosition = state.customGroupPositions.byId[state.customGroupPositions.byDeviceAndGroup[state.globals.selectedDeviceId][groupId]]
      return ({
        _id: customPosition._id,
        x: customPosition.x,
        y: customPosition.y,
        z: customPosition.z,
        rX: customPosition.rX,
        rY: customPosition.rY,
        rZ: customPosition.rZ,
        directivity: customPosition.directivity
      })
    }
  }
  return undefined
}
export const selectGroupPositionOfListener = (state: RootState): ThreeDimensionalProperties => {
  const stageDeviceId = selectStageDeviceIdOfSelectedDevice(state)
  if (stageDeviceId) {
    const groupId = state.stageDevices.byId[stageDeviceId]?.groupId
    if (groupId) {
      const customPosition = selectCustomGroupPositionByGroupId(state, groupId)
      if (customPosition) {
        return customPosition
      }
      return selectGroupPositionByGroupId(state, groupId)
    }
  }
  return DefaultThreeDimensionalProperties
}


/* STAGE MEMBER */
export const selectStageMemberById = (state: RootState, id: string): StageMember => state.stageMembers.byId[id]
export const selectStageMemberIdsByGroupId = (state: RootState, groupId: string): string[] => state.stageMembers.byGroup[groupId] || []
export const selectNameOfStageMemberId = (state: RootState, stageMemberId: string): string =>
  state.stageMembers.byId[stageMemberId].userId &&
  state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
  || stageMemberId
export const selectCustomStageMemberVolumeByStageMemberId = (state: RootState, stageMemberId: string): CustomStageMemberVolume | undefined =>
  state.globals.selectedDeviceId &&
  state.customStageMemberVolumes.byDeviceAndStageMember[state.globals.selectedDeviceId] &&
  state.customStageMemberVolumes.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]
    ? state.customStageMemberVolumes.byId[
      state.customStageMemberVolumes.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]
      ]
    : undefined
export const selectStageMemberPositionByStageMemberId = (state: RootState, stageMemberId: string): ThreeDimensionalProperties => {
  const position = state.stageMembers.byId[stageMemberId]
  if (position) {
    return ({
      x: position.x,
      y: position.y,
      z: position.z,
      rX: position.rX,
      rY: position.rY,
      rZ: position.rZ,
      directivity: position.directivity
    })
  }
  return DefaultThreeDimensionalProperties
}
export const selectCustomStageMemberPositionByStageMemberId = (state: RootState, stageMemberId: string): ThreeDimensionalProperties & { _id: string } | undefined => {
  if (state.globals.selectedDeviceId &&
    state.globals.selectedMode === "personal" &&
    state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId] &&
    state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]) {
    const customPosition = state.customStageMemberPositions.byId[state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]]
    return ({
      _id: customPosition._id,
      x: customPosition.x,
      y: customPosition.y,
      z: customPosition.z,
      rX: customPosition.rX,
      rY: customPosition.rY,
      rZ: customPosition.rZ,
      directivity: customPosition.directivity
    })
  }
  return undefined
}
export const selectStageMemberPositionOfListener = (state: RootState): ThreeDimensionalProperties => {
  const stageDeviceId = selectStageDeviceIdOfSelectedDevice(state)
  if (stageDeviceId) {
    const stageMemberId = state.stageDevices.byId[stageDeviceId]?.stageMemberId
    if (stageMemberId) {
      const customPosition = selectCustomStageMemberPositionByStageMemberId(state, stageMemberId)
      if (customPosition) {
        return customPosition
      }
      return selectStageMemberPositionByStageMemberId(state, stageMemberId)
    }
  }
  return DefaultThreeDimensionalProperties
}


// STAGE DEVICE
export const selectStageDeviceById = (state: RootState, id: string): StageDevice => state.stageDevices.byId[id]
export const selectStageDeviceIdsByStageMemberId = (state: RootState, stageMemberId: string): string[] => state.stageDevices.byStageMember[stageMemberId] || []
export const selectStageDeviceIdsByCurrentStage = (state: RootState): string[] => state.globals.stageId ? state.stageDevices.byStage[state.globals.stageId] : []
export const selectCustomStageDeviceVolumeByStageDeviceId = (state: RootState, stageDeviceId: string): CustomStageDeviceVolume | undefined =>
  state.globals.selectedDeviceId &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[state.globals.selectedDeviceId] &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[state.globals.selectedDeviceId][stageDeviceId]
    ? state.customStageDeviceVolumes.byId[
      state.customStageDeviceVolumes.byDeviceAndStageDevice[state.globals.selectedDeviceId][stageDeviceId]
      ]
    : undefined
export const selectStageDevicePositionByStageDeviceId = (state: RootState, stageDeviceId: string): ThreeDimensionalProperties => {
  const position = state.stageDevices.byId[stageDeviceId]
  if (position) {
    return ({
      x: position.x,
      y: position.y,
      z: position.z,
      rX: position.rX,
      rY: position.rY,
      rZ: position.rZ,
      directivity: position.directivity
    })
  }
  return DefaultThreeDimensionalProperties
}
export const selectCustomStageDevicePositionByStageDeviceId = (state: RootState, stageDeviceId: string): ThreeDimensionalProperties & { _id: string } | undefined => {
  if (state.globals.selectedDeviceId && state.globals.selectedMode === "personal" && state.customStageDevicePositions.byDeviceAndStageDevice[state.globals.selectedDeviceId] && state.customStageDevicePositions.byDeviceAndStageDevice[state.globals.selectedDeviceId][stageDeviceId]) {
    const customPosition = state.customStageDevicePositions.byId[state.customStageDevicePositions.byDeviceAndStageDevice[state.globals.selectedDeviceId][stageDeviceId]]
    return ({
      _id: customPosition._id,
      x: customPosition.x,
      y: customPosition.y,
      z: customPosition.z,
      rX: customPosition.rX,
      rY: customPosition.rY,
      rZ: customPosition.rZ,
      directivity: customPosition.directivity
    })
  }
  return undefined
}
export const selectStageDevicePositionOfListener = (state: RootState): ThreeDimensionalProperties => {
  const stageDeviceId = selectStageDeviceIdOfSelectedDevice(state)
  if (stageDeviceId) {
    const customPosition = selectCustomStageDevicePositionByStageDeviceId(state, stageDeviceId)
    if (customPosition) {
      return customPosition
    }
    return selectStageDevicePositionByStageDeviceId(state, stageDeviceId)
  }
  return DefaultThreeDimensionalProperties
}

// AUDIO TRACK
export const selectAudioTrackById = (state: RootState, audioTrackId: string): AudioTrack => state.audioTracks.byId[audioTrackId]
export const selectCustomAudioTrackVolumeByAudioTrackId = (state: RootState, audioTrackId: string): CustomAudioTrackVolume | undefined =>
  state.globals.selectedDeviceId &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.selectedDeviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]
    ? state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]
      ]
    : undefined
export const selectAudioTrackPositionByAudioTrackId = (state: RootState, audioTrackId: string): ThreeDimensionalProperties => {
  const position = state.audioTracks.byId[audioTrackId]
  if (position) {
    return ({
      x: position.x,
      y: position.y,
      z: position.z,
      rX: position.rX,
      rY: position.rY,
      rZ: position.rZ,
      directivity: position.directivity
    })
  }
  return DefaultThreeDimensionalProperties
}
export const selectCustomAudioTrackPositionByAudioTrackId = (state: RootState, audioTrackId: string): ThreeDimensionalProperties & { _id: string } | undefined => {
  if (state.globals.selectedDeviceId &&
    state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId] &&
    state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]
  ) {
    const customPosition = state.customAudioTrackPositions.byId[state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]]
    if (customPosition) {
      return ({
        _id: customPosition._id,
        x: customPosition.x,
        y: customPosition.y,
        z: customPosition.z,
        rX: customPosition.rX,
        rY: customPosition.rY,
        rZ: customPosition.rZ,
        directivity: customPosition.directivity
      })
    }
  }
  return undefined
}

// DEVICE
export const selectDeviceNameByStageDeviceId = (state: RootState, stageDeviceId: string): string => {
  const device = state.stageDevices.byId[stageDeviceId]
  if (device.userId === state.globals.localUserId && device.type === "browser") {
    // Use device instead of stage device for naming
    const browserDevice = state.devices.byId[device.deviceId] as BrowserDevice
    if (browserDevice?.browser)
      return browserDevice.name || `${browserDevice.browser} (${browserDevice.os})`
  }
  return device.name
}

// SOUND CARD
export const selectSoundCardById = (state: RootState, id: string): SoundCard | undefined => state.soundCards.byId[id]


// 3D RELATED
export const selectRender3DAudio = (state: RootState): boolean => state.globals.stageId ? state.stages.byId[state.globals.stageId].render3DAudio : false

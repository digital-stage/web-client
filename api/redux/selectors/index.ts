import {RootState} from "@digitalstage/api-client-react";
import {AuthUser} from "../state/Auth";
import {DefaultThreeDimensionalProperties, ThreeDimensionalProperties} from "@digitalstage/api-types";
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";

/***
 * Rules for these selectors:
 *  - if they depend on props, wrap it with createSelector and memoize the value at source components using useMemo or useCallback,
 *  - otherwise they are just simple methods
 */

// AUTH
export const selectSignedIn = (state: RootState): boolean => state.auth.initialized && !!state.auth.token
export const selectSignedOut = (state: RootState): boolean => state.auth.initialized && !state.auth.token
export const selectAuthUser = (state: RootState): AuthUser | undefined => state.auth.user
export const selectToken = (state: RootState): string | undefined => state.auth.token

// GLOBALS
export const selectLocalDeviceId = (state: RootState): string | undefined => state.globals.localDeviceId
export const selectShowOffline = (state: RootState): boolean => state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline || false
export const selectSelectedDeviceId = (state: RootState): string | undefined => state.globals.selectedDeviceId
export const selectSelectMode = (state: RootState) => state.globals.selectedMode
export const selectStageDeviceIdOfSelectedDevice = (state: RootState) => state.globals.stageId &&
state.globals.selectedDeviceId &&
state.stageDevices.byStageAndDevice[state.globals.stageId] &&
state.stageDevices.byStageAndDevice[state.globals.stageId][state.globals.selectedDeviceId]
    ? state.stageDevices.byStageAndDevice[state.globals.stageId][state.globals.selectedDeviceId]
    : undefined

// STAGE RELATED
export const selectCurrentStageId = (state: RootState) => state.globals.stageId
export const selectIsCurrentlyAdmin = (state: RootState) => state.globals.stageId && state.globals.localUserId
    ? state.stages.byId[state.globals.stageId].admins.some((id) => id === state.globals.localUserId)
    : false



export const selectStageDeviceIdsByStageMemberIdAndFilter = (state: RootState, stageMemberId: string) => {
    if (state.stageDevices.byStage[stageMemberId]) {
        if (state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline) {
            return state.stageDevices.byStage[stageMemberId]
        }
        return state.stageDevices.byStage[stageMemberId].filter(id => state.stageDevices.byId[id].active)
    }
    return []
}

// 3D RELATED
export const selectRender3DAudio = (state: RootState) => state.globals.stageId ? state.stages.byId[state.globals.stageId].render3DAudio : false
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
export const selectLocalStageDeviceId = (state: RootState) => state.globals.localStageDeviceId

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
    if (state.globals.selectedDeviceId) {
        const customPositionId = state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]
        if (customPositionId) {
            const customPosition = state.customAudioTrackPositions.byId[state.customAudioTrackPositions.byDeviceAndAudioTrack[state.globals.selectedDeviceId][audioTrackId]]
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


// STAGE MEMBER
export const selectNameOfStageMemberId = (state: RootState, stageMemberId: string): string =>
    state.stageMembers.byId[stageMemberId].userId &&
    state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
    || stageMemberId

// DEVICE
export const selectDeviceNameByStageDeviceId = (state: RootState, stageDeviceId: string) => {
    const device = state.stageDevices.byId[stageDeviceId]
    if (device.userId === state.globals.localUserId && device.type === "browser") {
        // Use device instead of stage device for naming
        const browserDevice = state.devices.byId[device.deviceId] as BrowserDevice
        if (browserDevice.browser)
            return browserDevice.name || `${browserDevice.browser} (${browserDevice.os})`
    }
    return device.name
}
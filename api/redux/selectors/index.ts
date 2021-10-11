import {createSelector} from "@reduxjs/toolkit";
import {RootState} from "../RootState";
import {StageDevice, StageMember} from "@digitalstage/api-types";

// Common
const selectId = (state: RootState, id: string) => id
const sortStageDevices = (a: StageDevice, b: StageDevice): number => {
    if (a.active === b.active) {
        if (a.stageMemberId == b.stageMemberId) {
            if (a._id === b._id) {
                return 0;
            } else if (a._id < b._id) {
                return -1
            } else {
                return 1
            }
        } else if (a.stageMemberId <= b.stageMemberId) {
            return -1
        } else {
            return 1
        }
    } else if (a.active) {
        return -1
    } else {
        return 1
    }
}
const sortStageMembers = (a: StageMember, b: StageMember): number => {
    if (a.active === b.active) {
        if (a.groupId == b.groupId) {
            if (a._id === b._id) {
                return 0;
            } else if (a._id < b._id) {
                return -1
            } else {
                return 1
            }
        } else if (a.groupId <= b.groupId) {
            return -1
        } else {
            return 1
        }
    } else if (a.active) {
        return -1
    } else {
        return 1
    }
}


export const selectReady = (state: RootState) => state.globals.ready
export const selectCurrentStageId = (state: RootState) => state.globals.stageId
export const selectCurrentStageMemberId = (state: RootState) => state.globals.stageMemberId
export const selectLocalDeviceId = (state: RootState) => state.globals.localDeviceId
export const selectSelectedDeviceId = (state: RootState) => state.globals.selectedDeviceId
export const selectSelectMode = (state: RootState) => state.globals.selectedMode

// Device
export const selectDevices = (state: RootState) => state.devices.byId
export const selectAllDeviceIds = (state: RootState) => state.devices.allIds
export const selectDeviceById = createSelector(
    selectDevices,
    selectId,
    (devices, deviceId) => devices[deviceId]
)

// Groups
export const selectGroups = (state: RootState) => state.groups.byId
export const selectAllGroupIds = (state: RootState) => state.groups.allIds
export const selectGroupById = createSelector(
    selectGroups,
    selectId,
    (groups, groupId) => groups[groupId]
)
export const selectGroupIdsByStage = createSelector(
    (state: RootState) => state.groups.byStage,
    selectId,
    (groupsByStage, id) => groupsByStage[id] || []
)
export const selectGroupIdsOfCurrentStage = createSelector(
    (state: RootState) => state.groups.byStage,
    selectCurrentStageId,
    (items, id) => id && items[id] || []
)


export const selectStageMemberById = (state: RootState, stageMemberId: string) => state.stageMembers.byId[stageMemberId]

// Display mode
export const selectDisplayMode = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, deviceId) => deviceId && devices[deviceId]?.displayMode || "boxes"
)

export const selectShowLanes = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, deviceId) => deviceId && devices[deviceId]?.displayMode === 'lanes' || false
)


export const selectShowOffline = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, deviceId) => deviceId && devices[deviceId]?.showOffline || false
)

export const selectNumLanes = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, deviceId) => deviceId && devices[deviceId]?.numLanes !== undefined ? devices[deviceId].numLanes as number : 2
)

export const selectNumBoxes = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, deviceId) => deviceId && devices[deviceId]?.numBoxes !== undefined ? devices[deviceId].numBoxes as number : 3
)

export const selectNumCols = createSelector(
    selectDevices,
    selectLocalDeviceId,
    (devices, id) => id
        ? devices[id].displayMode === "lanes"
            ? devices[id]?.numLanes || 2
            : devices[id]?.numBoxes || 3
        : 3
)

// STAGE MEMBERS
export const selectStageMembers = (state: RootState) => state.stageMembers.byId
export const selectAllStageMemberIds = (state: RootState) => state.stageMembers.allIds
const selectStageMembersByGroup = (state: RootState) => state.stageMembers.byGroup
export const selectAndFilterStageMemberIds = createSelector(
    selectAllStageMemberIds,
    selectStageMembers,
    selectShowOffline,
    (byStageMembers, byId, showOffline) =>
        showOffline
            ? byStageMembers.filter(id => byId[id].active).sort((a, b) => sortStageMembers(byId[a], byId[b]))
            : [...byStageMembers].sort((a, b) => sortStageMembers(byId[a], byId[b]))
)
export const selectAndFilterStageMemberIdsByGroup = createSelector(
    selectStageMembersByGroup,
    selectStageMembers,
    selectId,
    selectShowOffline,
    (byStageMembers, byId, stageMemberId, showOffline) =>
        byStageMembers[stageMemberId] ?
            showOffline
                ? byStageMembers[stageMemberId].filter(id => byId[id].active).sort((a, b) => sortStageMembers(byId[a], byId[b]))
                : [...byStageMembers[stageMemberId]].sort((a, b) => sortStageMembers(byId[a], byId[b]))
            : []
)


// STAGE DEVICES
export const selectStageDevices = (state: RootState) => state.stageDevices.byId
export const selectAllStageDeviceIds = (state: RootState) => state.stageDevices.allIds
const selectStageDevicesByStageMembers = (state: RootState) => state.stageDevices.byStageMember
export const selectStageDeviceById = createSelector(
    selectStageDevices,
    selectId,
    (items, id) => items[id]
)
export const selectAndFilterStageDeviceIdsByStageMember = createSelector(
    selectStageDevicesByStageMembers,
    selectStageDevices,
    selectId,
    selectShowOffline,
    (byStageMembers, byId, stageMemberId, showOffline) =>
        byStageMembers[stageMemberId] ?
            showOffline
                ? byStageMembers[stageMemberId].filter(id => byId[id].active).sort((a, b) => sortStageDevices(byId[a], byId[b]))
                : [...byStageMembers[stageMemberId]].sort((a, b) => sortStageDevices(byId[a], byId[b]))
            : []
)
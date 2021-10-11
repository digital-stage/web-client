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

import {StageDevice, StageMember} from "@digitalstage/api-types";
import {useStageSelector} from "@digitalstage/api-client-react";

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

const useFilteredStageMembers = () => useStageSelector(state => {
    if (state.globals.stageId && state.globals.localDeviceId) {
        if (state.devices.byId[state.globals.localDeviceId].showOffline) {
            return [...state.stageMembers.byStage[state.globals.stageId]].sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
        }
        return state.stageMembers.byStage[state.globals.stageId].filter(id => state.stageMembers.byId[id].active).sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
    }
    return []
})


const useFilteredStageMembersByGroup = (groupId: string) => useStageSelector(state => {
    if (state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline) {
        return [...state.stageMembers.byGroup[groupId]].sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
    }
    return state.stageMembers.byGroup[groupId].filter(id => state.stageMembers.byId[id].active).sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
})

const useFilteredStageDevicesOfStageMember = (stageMemberId: string) => useStageSelector(state => {
    if (stageMemberId) {
        if (state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].showOffline) {
            return [...state.stageDevices.byStageMember[stageMemberId]].sort((a, b) => sortStageDevices(state.stageDevices.byId[a], state.stageDevices.byId[b]))
        }
        return state.stageDevices.byStageMember[stageMemberId].filter(id => state.stageDevices.byId[id].active).sort((a, b) => sortStageDevices(state.stageDevices.byId[a], state.stageDevices.byId[b]))
    }
    return []
})

export {useFilteredStageMembers, useFilteredStageMembersByGroup, useFilteredStageDevicesOfStageMember, sortStageMembers, sortStageDevices}

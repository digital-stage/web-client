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

import omit from 'lodash/omit'
import without from 'lodash/without'
import {
    ServerDevicePayloads,
    ServerDeviceEvents,
    CustomStageMemberVolume,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { CustomStageMemberVolumes } from '../state/CustomStageMemberVolumes'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import {ReducerAction} from "../actions/ReducerAction";

const addCustomStageMemberVolume = (
    state: CustomStageMemberVolumes,
    customStageMember: CustomStageMemberVolume
): CustomStageMemberVolumes => ({
    ...state,
    byId: {
        ...state.byId,
        [customStageMember._id]: customStageMember,
    },
    byStageMember: {
        ...state.byStageMember,
        [customStageMember.stageMemberId]: upsert<string>(
            state.byStageMember[customStageMember.stageMemberId],
            customStageMember._id
        ),
    },
    byDevice: {
        ...state.byDevice,
        [customStageMember.deviceId]: upsert<string>(
            state.byDevice[customStageMember.deviceId],
            customStageMember._id
        ),
    },
    byDeviceAndStageMember: {
        ...state.byDeviceAndStageMember,
        [customStageMember.deviceId]: {
            ...state.byDeviceAndStageMember[customStageMember.deviceId],
            [customStageMember.stageMemberId]: customStageMember._id,
        },
    },
    allIds: upsert<string>(state.allIds, customStageMember._id),
})

function reduceCustomStageMemberVolumes(
    state: CustomStageMemberVolumes = {
        byId: {},
        byDevice: {},
        byStageMember: {},
        byDeviceAndStageMember: {},
        allIds: [],
    },
    action: ReducerAction
): CustomStageMemberVolumes {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byStageMember: {},
                byDeviceAndStageMember: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customStageMemberVolumes } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customStageMemberVolumes)
                customStageMemberVolumes.forEach((customStageMemberVolume) => {
                    updatedState = addCustomStageMemberVolume(updatedState, customStageMemberVolume)
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomStageMemberVolumeAdded: {
            const customStageMemberVolume =
                action.payload as ServerDevicePayloads.CustomStageMemberVolumeAdded
            return addCustomStageMemberVolume(state, customStageMemberVolume)
        }
        case ServerDeviceEvents.CustomStageMemberVolumeChanged: {
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload._id]: {
                        ...state.byId[action.payload._id],
                        ...action.payload,
                    },
                },
            }
        }
        case ServerDeviceEvents.CustomStageMemberVolumeRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { stageMemberId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byStageMember: {
                        ...state.byStageMember,
                        [stageMemberId]: without(state.byStageMember[stageMemberId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndStageMember: {
                        ...state.byDeviceAndStageMember,
                        [deviceId]: omit(state.byDeviceAndStageMember[deviceId], stageMemberId),
                    },
                    allIds: without<string>(state.allIds, id),
                }
            }
            return state
        }
        default:
            return state
    }
}

export { reduceCustomStageMemberVolumes }

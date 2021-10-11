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
    CustomGroupPosition,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { CustomGroupPositions } from '../state/CustomGroupPositions'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import {ReducerAction} from "../actions/ReducerAction";

const addCustomGroupPosition = (
    state: CustomGroupPositions,
    customGroup: CustomGroupPosition
): CustomGroupPositions => ({
    ...state,
    byId: {
        ...state.byId,
        [customGroup._id]: customGroup,
    },
    byGroup: {
        ...state.byGroup,
        [customGroup.groupId]: upsert<string>(state.byGroup[customGroup.groupId], customGroup._id),
    },
    byDevice: {
        ...state.byDevice,
        [customGroup.deviceId]: upsert<string>(
            state.byDevice[customGroup.deviceId],
            customGroup._id
        ),
    },
    byDeviceAndGroup: {
        ...state.byDeviceAndGroup,
        [customGroup.deviceId]: {
            ...state.byDeviceAndGroup[customGroup.deviceId],
            [customGroup.groupId]: customGroup._id,
        },
    },
    allIds: upsert<string>(state.allIds, customGroup._id),
})

function reduceCustomGroupPositions(
    state: CustomGroupPositions = {
        byId: {},
        byDevice: {},
        byGroup: {},
        byDeviceAndGroup: {},
        allIds: [],
    },
    action: ReducerAction
): CustomGroupPositions {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byGroup: {},
                byDeviceAndGroup: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customGroupPositions } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customGroupPositions)
                customGroupPositions.forEach((customGroup) => {
                    updatedState = addCustomGroupPosition(updatedState, customGroup)
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomGroupPositionAdded: {
            const customGroup = action.payload as ServerDevicePayloads.CustomGroupPositionAdded
            return addCustomGroupPosition(state, customGroup)
        }
        case ServerDeviceEvents.CustomGroupPositionChanged: {
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
        case ServerDeviceEvents.CustomGroupPositionRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { groupId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byGroup: {
                        ...state.byGroup,
                        [groupId]: without(state.byGroup[groupId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndGroup: {
                        ...state.byDeviceAndGroup,
                        [deviceId]: omit(state.byDeviceAndGroup[deviceId], groupId),
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

export { reduceCustomGroupPositions }

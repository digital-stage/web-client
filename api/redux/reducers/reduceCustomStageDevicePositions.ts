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
    CustomStageDevicePosition,
    ServerDeviceEvents,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { CustomStageDevicePositions } from '../state/CustomStageDevicePositions'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import {ReducerAction} from "../actions/ReducerAction";

const addCustomStageDevicePosition = (
    state: CustomStageDevicePositions,
    customStageDevicePosition: CustomStageDevicePosition
): CustomStageDevicePositions => ({
    ...state,
    byId: {
        ...state.byId,
        [customStageDevicePosition._id]: customStageDevicePosition,
    },
    byStageDevice: {
        ...state.byStageDevice,
        [customStageDevicePosition.stageDeviceId]: upsert<string>(
            state.byStageDevice[customStageDevicePosition.stageDeviceId],
            customStageDevicePosition._id
        ),
    },
    byDevice: {
        ...state.byDevice,
        [customStageDevicePosition.deviceId]: upsert<string>(
            state.byDevice[customStageDevicePosition.deviceId],
            customStageDevicePosition._id
        ),
    },
    byDeviceAndStageDevice: {
        ...state.byDeviceAndStageDevice,
        [customStageDevicePosition.deviceId]: {
            ...state.byDeviceAndStageDevice[customStageDevicePosition.deviceId],
            [customStageDevicePosition.stageDeviceId]: customStageDevicePosition._id,
        },
    },
    allIds: upsert<string>(state.allIds, customStageDevicePosition._id),
})

function reduceCustomStageDevicePositions(
    state: CustomStageDevicePositions = {
        byId: {},
        byDevice: {},
        byStageDevice: {},
        byDeviceAndStageDevice: {},
        allIds: [],
    },
    action: ReducerAction
): CustomStageDevicePositions {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byStageDevice: {},
                byDeviceAndStageDevice: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customStageDevicePositions } =
                action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customStageDevicePositions)
                customStageDevicePositions.forEach((customStageDevicePosition) => {
                    updatedState = addCustomStageDevicePosition(
                        updatedState,
                        customStageDevicePosition
                    )
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomStageDevicePositionAdded: {
            const customStageDevicePosition =
                action.payload as ServerDevicePayloads.CustomStageDevicePositionAdded
            return addCustomStageDevicePosition(state, customStageDevicePosition)
        }
        case ServerDeviceEvents.CustomStageDevicePositionChanged: {
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
        case ServerDeviceEvents.CustomStageDevicePositionRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { stageDeviceId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byStageDevice: {
                        ...state.byStageDevice,
                        [stageDeviceId]: without(state.byStageDevice[stageDeviceId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndStageDevice: {
                        ...state.byDeviceAndStageDevice,
                        [deviceId]: omit(state.byDeviceAndStageDevice[deviceId], stageDeviceId),
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

export { reduceCustomStageDevicePositions }

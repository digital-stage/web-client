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
import { ServerDeviceEvents, ServerDevicePayloads, Stage } from '@digitalstage/api-types'
import { Stages } from '../state/Stages'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import {ReducerAction} from "../actions/ReducerAction";

const addStage = (state: Stages, stage: Stage): Stages => ({
    ...state,
    byId: {
        ...state.byId,
        [stage._id]: stage,
    },
    allIds: upsert<string>(state.allIds, stage._id),
})

function reduceStages(
    state: Stages = {
        byId: {},
        allIds: [],
    },
    action: ReducerAction
): Stages {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { stage } = action.payload as ServerDevicePayloads.StageJoined
            if (stage) return addStage(state, stage)
            return state
        }
        case ServerDeviceEvents.StageAdded: {
            const stage = action.payload as ServerDevicePayloads.StageAdded
            return addStage(state, stage)
        }
        case ServerDeviceEvents.StageChanged:
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
        case ServerDeviceEvents.StageRemoved:
            return {
                ...state,
                byId: omit(state.byId, action.payload),
                allIds: without<string>(state.allIds, action.payload),
            }
        default:
            return state
    }
}

export { reduceStages }

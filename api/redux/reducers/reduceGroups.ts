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
import { ServerDeviceEvents, ServerDevicePayloads, Group } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { Groups } from '../state/Groups'

const addGroup = (state: Groups, group: Group): Groups => ({
    ...state,
    byId: {
        ...state.byId,
        [group._id]: group,
    },
    byStage: {
        ...state.byStage,
        [group.stageId]: upsert<string>(state.byStage[group.stageId], group._id),
    },
    allIds: upsert<string>(state.allIds, group._id),
})

function reduceGroups(
    prev: Groups = {
        byId: {},
        byStage: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): Groups {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byStage: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { groups } = action.payload as ServerDevicePayloads.StageJoined
            let state = { ...prev }
            if (groups)
                groups.forEach((group) => {
                    state = addGroup(state, group)
                })
            return state
        }
        case ServerDeviceEvents.GroupAdded: {
            const group = action.payload as ServerDevicePayloads.GroupAdded
            return addGroup(prev, group)
        }
        case ServerDeviceEvents.GroupChanged:
            return {
                ...prev,
                byId: {
                    ...prev.byId,
                    [action.payload._id]: {
                        ...prev.byId[action.payload._id],
                        ...action.payload,
                    },
                },
            }
        case ServerDeviceEvents.GroupRemoved: {
            const id = action.payload as ServerDevicePayloads.GroupRemoved
            const { stageId } = prev.byId[id]
            return {
                ...prev,
                byId: omit(prev.byId, action.payload),
                byStage: {
                    ...prev.byStage,
                    [stageId]: without<string>(prev.byStage[stageId], id),
                },
                allIds: without<string>(prev.allIds, action.payload),
            }
        }
        default:
            return prev
    }
}

export { reduceGroups }

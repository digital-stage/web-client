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

import { StageMember, ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { StageMembers } from '../state/StageMembers'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { logger } from '../../logger'

const { reportError } = logger('reduceStageMembers')

const addStageMember = (prev: StageMembers, stageMember: StageMember): StageMembers => ({
    ...prev,
    byId: {
        ...prev.byId,
        [stageMember._id]: stageMember,
    },
    byStage: {
        ...prev.byStage,
        [stageMember.stageId]: upsert<string>(prev.byStage[stageMember.stageId], stageMember._id),
    },
    byUser: {
        ...prev.byUser,
        [stageMember.userId]: upsert<string>(prev.byUser[stageMember.userId], stageMember._id),
    },
    byGroup: {
        ...prev.byGroup,
        [stageMember.groupId]: upsert<string>(prev.byGroup[stageMember.groupId], stageMember._id),
    },
    allIds: upsert<string>(prev.allIds, stageMember._id),
})

function reduceStageMembers(
    prev: StageMembers = {
        byId: {},
        byStage: {},
        byGroup: {},
        byUser: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): StageMembers {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byStage: {},
                byGroup: {},
                byUser: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { stageMembers } = action.payload as ServerDevicePayloads.StageJoined
            let state = { ...prev }
            if (stageMembers)
                stageMembers.forEach((stageMember) => {
                    state = addStageMember(state, stageMember)
                })
            return state
        }
        case ServerDeviceEvents.StageMemberAdded: {
            const stageMember = action.payload as StageMember
            return addStageMember(prev, stageMember)
        }
        case ServerDeviceEvents.StageMemberChanged: {
            const stageMember = action.payload as Partial<StageMember> & {
                _id: string
            }
            const previousStageMember = prev.byId[stageMember._id]
            if (!previousStageMember) {
                reportError(`Could not find previous stage member ${stageMember._id}`)
                return prev
            }
            if (stageMember.groupId && stageMember.groupId !== previousStageMember.groupId) {
                return {
                    ...prev,
                    byId: {
                        ...prev.byId,
                        [stageMember._id]: {
                            ...previousStageMember,
                            ...stageMember,
                        },
                    },
                    byGroup: {
                        ...prev.byGroup,
                        [previousStageMember.groupId]: without<string>(
                            prev.byGroup[previousStageMember.groupId],
                            stageMember._id
                        ),
                        [stageMember.groupId]: upsert<string>(
                            prev.byGroup[stageMember.groupId],
                            stageMember._id
                        ),
                    },
                }
            }
            return {
                ...prev,
                byId: {
                    ...prev.byId,
                    [stageMember._id]: {
                        ...previousStageMember,
                        ...stageMember,
                    },
                },
            }
        }
        case ServerDeviceEvents.StageMemberRemoved: {
            const id = action.payload as string
            const { stageId, groupId, userId } = prev.byId[id]
            return {
                ...prev,
                byId: omit(prev.byId, id),
                byStage: {
                    ...prev.byStage,
                    [stageId]: without<string>(prev.byStage[stageId], action.payload),
                },
                byGroup: {
                    ...prev.byGroup,
                    [groupId]: without<string>(prev.byGroup[groupId], action.payload),
                },
                byUser: {
                    ...prev.byUser,
                    [userId]: without<string>(prev.byUser[userId], action.payload),
                },
                allIds: without<string>(prev.allIds, id),
            }
        }
        default:
            return prev
    }
}

export { reduceStageMembers }

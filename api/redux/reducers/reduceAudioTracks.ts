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
import { ServerDeviceEvents, ServerDevicePayloads, AudioTrack } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { AudioTracks } from '../state/AudioTracks'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const addAudioTrack = (state: AudioTracks, audioTrack: AudioTrack): AudioTracks => ({
    ...state,
    byId: {
        ...state.byId,
        [audioTrack._id]: audioTrack,
    },
    byStageMember: {
        ...state.byStageMember,
        [audioTrack.stageMemberId]: upsert<string>(
            state.byStageMember[audioTrack.stageMemberId],
            audioTrack._id
        ),
    },
    byStageDevice: {
        ...state.byStageDevice,
        [audioTrack.stageDeviceId]: upsert<string>(
            state.byStageDevice[audioTrack.stageDeviceId],
            audioTrack._id
        ),
    },
    byUser: {
        ...state.byUser,
        [audioTrack.userId]: upsert<string>(state.byUser[audioTrack.userId], audioTrack._id),
    },
    byStage: {
        ...state.byStage,
        [audioTrack.stageId]: upsert<string>(state.byStage[audioTrack.stageId], audioTrack._id),
    },
    allIds: upsert<string>(state.allIds, audioTrack._id),
})

function reduceAudioTracks(
    state: AudioTracks = {
        byId: {},
        byStageMember: {},
        byStageDevice: {},
        byStage: {},
        byUser: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): AudioTracks {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byStageMember: {},
                byStageDevice: {},
                byStage: {},
                byUser: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { audioTracks } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (audioTracks)
                audioTracks.forEach((audioTrack) => {
                    updatedState = addAudioTrack(updatedState, audioTrack)
                })
            return updatedState
        }
        case ServerDeviceEvents.AudioTrackAdded: {
            const remoteAudioTrack = action.payload as ServerDevicePayloads.AudioTrackAdded
            return addAudioTrack(state, remoteAudioTrack)
        }
        case ServerDeviceEvents.AudioTrackChanged: {
            const update = action.payload as ServerDevicePayloads.AudioTrackChanged
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [update._id]: {
                        ...state.byId[update._id],
                        ...update,
                    },
                },
            }
        }
        case ServerDeviceEvents.AudioTrackRemoved: {
            const id = action.payload as ServerDevicePayloads.AudioTrackRemoved
            if (!state.byId[id]) {
                return state
            }
            const { stageId, stageMemberId, stageDeviceId, userId } = state.byId[id]
            return {
                ...state,
                byId: omit(state.byId, id),
                byStageMember: {
                    ...state.byStageMember,
                    [stageMemberId]: without(state.byStageMember[stageMemberId], id),
                },
                byStageDevice: {
                    ...state.byStageDevice,
                    [stageDeviceId]: without(state.byStageDevice[stageDeviceId], id),
                },
                byStage: {
                    ...state.byStage,
                    [stageId]: without(state.byStage[stageId], id),
                },
                byUser: {
                    ...state.byUser,
                    [userId]: without(state.byUser[userId], id),
                },
                allIds: without<string>(state.allIds, id),
            }
        }
        default:
            return state
    }
}

export { reduceAudioTracks }

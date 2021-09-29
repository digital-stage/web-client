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
import { ServerDeviceEvents, ServerDevicePayloads, VideoTrack } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { VideoTracks } from '../state/VideoTracks'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const addVideoTrack = (state: VideoTracks, videoTrack: VideoTrack): VideoTracks => ({
    ...state,
    byId: {
        ...state.byId,
        [videoTrack._id]: videoTrack,
    },
    byStageMember: {
        ...state.byStageMember,
        [videoTrack.stageMemberId]: upsert<string>(
            state.byStageMember[videoTrack.stageMemberId],
            videoTrack._id
        ),
    },
    byStageDevice: {
        ...state.byStageDevice,
        [videoTrack.stageDeviceId]: upsert<string>(
            state.byStageDevice[videoTrack.stageDeviceId],
            videoTrack._id
        ),
    },
    byUser: {
        ...state.byUser,
        [videoTrack.userId]: upsert<string>(state.byUser[videoTrack.userId], videoTrack._id),
    },
    byStage: {
        ...state.byStage,
        [videoTrack.stageId]: upsert<string>(state.byStage[videoTrack.stageId], videoTrack._id),
    },
    allIds: upsert<string>(state.allIds, videoTrack._id),
})

function reduceVideoTracks(
    state: VideoTracks = {
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
): VideoTracks {
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
            const { videoTracks } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (videoTracks)
                videoTracks.forEach((videoTrack: VideoTrack) => {
                    updatedState = addVideoTrack(updatedState, videoTrack)
                })
            return updatedState
        }
        case ServerDeviceEvents.VideoTrackAdded: {
            const videoTrack = action.payload as ServerDevicePayloads.VideoTrackAdded
            return addVideoTrack(state, videoTrack)
        }
        case ServerDeviceEvents.VideoTrackChanged: {
            const update = action.payload as ServerDevicePayloads.VideoTrackChanged
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
        case ServerDeviceEvents.VideoTrackRemoved: {
            const id = action.payload as ServerDevicePayloads.VideoTrackRemoved
            if (!state.byId[id]) {
                return state
            }
            const { stageId, stageMemberId, userId, stageDeviceId } = state.byId[id]
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

export { reduceVideoTracks }

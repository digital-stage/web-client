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
    CustomAudioTrackVolume,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { CustomAudioTrackVolumes } from '../state/CustomAudioTrackVolumes'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const addCustomAudioTrackVolume = (
    state: CustomAudioTrackVolumes,
    customAudioTrack: CustomAudioTrackVolume
): CustomAudioTrackVolumes => ({
    ...state,
    byId: {
        ...state.byId,
        [customAudioTrack._id]: customAudioTrack,
    },
    byAudioTrack: {
        ...state.byAudioTrack,
        [customAudioTrack.audioTrackId]: upsert<string>(
            state.byAudioTrack[customAudioTrack.audioTrackId],
            customAudioTrack._id
        ),
    },
    byDevice: {
        ...state.byDevice,
        [customAudioTrack.deviceId]: upsert<string>(
            state.byDevice[customAudioTrack.deviceId],
            customAudioTrack._id
        ),
    },
    byDeviceAndAudioTrack: {
        ...state.byDeviceAndAudioTrack,
        [customAudioTrack.deviceId]: {
            ...state.byDeviceAndAudioTrack[customAudioTrack.deviceId],
            [customAudioTrack.audioTrackId]: customAudioTrack._id,
        },
    },
    allIds: upsert<string>(state.allIds, customAudioTrack._id),
})

function reduceCustomAudioTrackVolumes(
    state: CustomAudioTrackVolumes = {
        byId: {},
        byDevice: {},
        byAudioTrack: {},
        byDeviceAndAudioTrack: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): CustomAudioTrackVolumes {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byAudioTrack: {},
                byDeviceAndAudioTrack: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customAudioTrackVolumes } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customAudioTrackVolumes)
                customAudioTrackVolumes.forEach((customAudioTrack) => {
                    updatedState = addCustomAudioTrackVolume(updatedState, customAudioTrack)
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomAudioTrackVolumeAdded: {
            const customGroup = action.payload as ServerDevicePayloads.CustomAudioTrackVolumeAdded
            return addCustomAudioTrackVolume(state, customGroup)
        }
        case ServerDeviceEvents.CustomAudioTrackVolumeChanged: {
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
        case ServerDeviceEvents.CustomAudioTrackVolumeRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { audioTrackId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byAudioTrack: {
                        ...state.byAudioTrack,
                        [audioTrackId]: without(state.byAudioTrack[audioTrackId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndAudioTrack: {
                        ...state.byDeviceAndAudioTrack,
                        [deviceId]: omit(state.byDeviceAndAudioTrack[deviceId], audioTrackId),
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

export { reduceCustomAudioTrackVolumes }

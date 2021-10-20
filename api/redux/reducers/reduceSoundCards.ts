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
import {SoundCard, ServerDevicePayloads, ServerDeviceEvents} from '@digitalstage/api-types'
import without from 'lodash/without'
import {SoundCards} from '../state/SoundCards'
import {upsert} from '../utils/upsert'
import {ReducerAction} from "../actions/ReducerAction";

function reduceSoundCards(
    state: SoundCards = {
        byId: {},
        input: {
            byDevice: {},
            byDeviceAndDriver: {},
        },
        output: {
            byDevice: {},
            byDeviceAndDriver: {}
        },
        allIds: [],
    },
    action: ReducerAction
): SoundCards {
    switch (action.type) {
        case ServerDeviceEvents.SoundCardAdded: {
            const soundCard: SoundCard = action.payload as ServerDevicePayloads.SoundCardAdded
            const {_id, deviceId, type, audioDriver} = soundCard
            const input = type && type === "input" ? {
                byDevice: {
                    ...state.input.byDevice,
                    [deviceId]: upsert<string>(state.input.byDevice[deviceId], _id)
                },
                byDeviceAndDriver: {
                    ...state.input.byDeviceAndDriver,
                    [deviceId]: {
                        ...state.input.byDeviceAndDriver[deviceId],
                        [audioDriver]: state.input.byDeviceAndDriver[deviceId] ? upsert<string>(state.input.byDeviceAndDriver[deviceId][audioDriver], _id) : [_id]
                    }
                }
            } : state.input;
            const output = type && type === "output" ? {
                byDevice: {
                    ...state.output.byDevice,
                    [deviceId]: upsert<string>(state.output.byDevice[deviceId], _id)
                },
                byDeviceAndDriver: {
                    ...state.output.byDeviceAndDriver,
                    [deviceId]: {
                        ...state.output.byDeviceAndDriver[deviceId],
                        [audioDriver]: state.output.byDeviceAndDriver[deviceId] ? upsert<string>(state.output.byDeviceAndDriver[deviceId][audioDriver], _id) : [_id]
                    }
                }
            } : state.output;
            return {
                byId: {
                    ...state.byId,
                    [_id]: soundCard,
                },
                input,
                output,
                allIds: upsert<string>(state.allIds, soundCard._id),
            }
        }
        case ServerDeviceEvents.SoundCardChanged: {
            const soundCard = action.payload as ServerDevicePayloads.SoundCardChanged

            return {
                ...state,
                byId: {
                    ...state.byId,
                    [soundCard._id]: {
                        ...state.byId[soundCard._id],
                        ...soundCard,
                    },
                },
            }
        }
        case ServerDeviceEvents.SoundCardRemoved: {
            const removedId: string = action.payload as ServerDevicePayloads.SoundCardRemoved
            const {deviceId, audioDriver, type} = state.byId[removedId]
            const input = deviceId && audioDriver && type && type === "input" ? {
                byDevice: {
                    [deviceId]: without(state.input.byDevice[deviceId], removedId)
                },
                byDeviceAndDriver: {
                    [deviceId]: {
                        [audioDriver]: without(state.input.byDeviceAndDriver[deviceId][audioDriver], removedId)
                    }
                }
            } : state.input
            const output = deviceId && audioDriver && type && type === "output" ? {
                byDevice: {
                    [deviceId]: without(state.output.byDevice[deviceId], removedId)
                },
                byDeviceAndDriver: {
                    [deviceId]: {
                        [audioDriver]: without(state.output.byDeviceAndDriver[deviceId][audioDriver], removedId)
                    }
                }
            } : state.output
            return {
                ...state,
                byId: omit(state.byId, removedId),
                input,
                output,
                allIds: state.allIds.filter((id) => id !== removedId),
            }
        }
        default:
            return state
    }
}

export {reduceSoundCards}

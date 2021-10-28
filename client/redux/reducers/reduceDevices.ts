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
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { Devices } from '../state/Devices'
import {ReducerAction} from "../actions/ReducerAction";

function reduceDevices(
    state: Devices = {
        byId: {},
        allIds: [],
    },
    action: ReducerAction
): Devices {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.LocalDeviceReady:
        case ServerDeviceEvents.DeviceAdded: {
            const device = action.payload as ServerDevicePayloads.DeviceAdded
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [device._id]: {
                        ...device,
                    },
                },
                allIds: upsert<string>(state.allIds, device._id),
            }
        }
        case ServerDeviceEvents.DeviceChanged: {
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
        case ServerDeviceEvents.DeviceRemoved: {
            return {
                ...state,
                byId: omit(state.byId, action.payload),
                allIds: without<string>(state.allIds, action.payload),
            }
        }
        default:
            return state
    }
}

export { reduceDevices }

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
import { ServerDevicePayloads, ServerDeviceEvents } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { Routers } from '../state/Routers'
import {ReducerAction} from "../actions/ReducerAction";

function reduceRouters(
    state: Routers = {
        byId: {},
        byCity: {},
        byCountryCode: {},
        byType: {},
        allIds: [],
    },
    action: ReducerAction
): Routers {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byCity: {},
                byCountryCode: {},
                byType: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.RouterAdded: {
            const router = action.payload as ServerDevicePayloads.RouterAdded
            let byType = {
                ...state.byType,
            }
            Object.keys(router.types).forEach((type) => {
                byType = {
                    ...byType,
                    [type]: upsert<string>(byType[type], router._id),
                }
            })
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [router._id]: router,
                },
                byCountryCode: {
                    ...state.byCountryCode,
                    [router.countryCode]: upsert<string>(
                        state.byCountryCode[router.countryCode],
                        router._id
                    ),
                },
                byCity: {
                    ...state.byCity,
                    [router.city]: upsert<string>(state.byCity[router.city], router._id),
                },
                // byType: byType,
                allIds: upsert<string>(state.allIds, router._id),
            }
        }
        case ServerDeviceEvents.RouterChanged: {
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload._id]: {
                        ...state.byId[action.payload._id],
                        ...action.payload,
                    },
                },
                // Other values should not change, but
                // TODO: Implement logic to support these changes later
            }
        }
        case ServerDeviceEvents.RouterRemoved: {
            const id = action.payload as ServerDevicePayloads.RouterRemoved
            const { countryCode, city } = state.byId[id]
            return {
                ...state,
                byId: omit(state.byId, action.payload),
                byCountryCode: {
                    ...state.byCountryCode,
                    [countryCode]: without<string>(
                        state.byCountryCode[countryCode],
                        action.payload
                    ),
                },
                byCity: {
                    ...state.byCity,
                    [city]: without<string>(state.byCity[city], action.payload),
                },
                /*
        byType: Object.keys(state.byType).map(type => {
          if(Object.keys(types).find(t => t === type)) {
            return without<string>(state.byType[type], action.payload);
          }
          return state.byType[type]
        }), */
                allIds: without<string>(state.allIds, action.payload),
            }
        }
        default:
            return state
    }
}

export { reduceRouters }

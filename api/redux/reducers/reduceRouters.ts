import omit from 'lodash/omit'
import without from 'lodash/without'
import { ServerDevicePayloads, ServerDeviceEvents } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { Routers } from '../state/Routers'

function reduceRouters(
    state: Routers = {
        byId: {},
        byCity: {},
        byCountryCode: {},
        byType: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
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

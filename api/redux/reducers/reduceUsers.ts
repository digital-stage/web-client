import omit from 'lodash/omit'
import without from 'lodash/without'
import { User, ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import Users from '../state/Users'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const addUser = (state: Users, user: User): Users => ({
    ...state,
    byId: {
        ...state.byId,
        [user._id]: user,
    },
    allIds: upsert<string>(state.allIds, user._id),
})

function reduceUsers(
    state: Users = {
        byId: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): Users {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { users } = action.payload as ServerDevicePayloads.StageJoined
            let updated = { ...state }
            if (users)
                users.forEach((user) => {
                    updated = addUser(updated, user)
                })
            return updated
        }
        case ServerDeviceEvents.UserReady: {
            const user = action.payload as User
            return addUser(state, user)
        }
        case ServerDeviceEvents.UserAdded: {
            const user = action.payload as User
            return addUser(state, user)
        }
        case ServerDeviceEvents.UserChanged:
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
        case ServerDeviceEvents.UserRemoved:
            return {
                ...state,
                byId: omit(state.byId, action.payload),
                allIds: without<string>(state.allIds, action.payload),
            }
        default:
            return state
    }
}

export default reduceUsers

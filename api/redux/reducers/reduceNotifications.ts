import InternalActionTypes from '../actions/InternalActionTypes'
import Notifications from '../state/Notifications'
import {
    AddNotificationPayload,
    ChangeNotificationPayload,
    RemoveNotificationPayload,
} from '../actions/clientActions'
import omit from 'lodash/omit'
import without from 'lodash/without'

function reduceNotifications(
    state: Notifications = {
        byId: {},
        allIds: [],
    },
    action: {
        type: string
        payload: unknown
    }
): Notifications {
    switch (action.type) {
        case InternalActionTypes.ADD_NOTIFICATION:
            const notification = action.payload as AddNotificationPayload
            return {
                byId: {
                    ...state.byId,
                    [notification.id]: notification,
                },
                allIds: [...state.allIds, notification.id],
            }
        case InternalActionTypes.CHANGE_NOTIFICATION: {
            const update = action.payload as ChangeNotificationPayload
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [update.id]: {
                        ...state.byId[update.id],
                        ...update,
                    },
                },
            }
        }
        case InternalActionTypes.REMOVE_NOTIFICATION: {
            const id = action.payload as RemoveNotificationPayload
            return {
                byId: omit(state.byId, id),
                allIds: without<string>(state.allIds, id),
            }
        }
        default:
            return state
    }
}

export default reduceNotifications

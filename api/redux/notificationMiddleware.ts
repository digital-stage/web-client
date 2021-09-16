import { Middleware } from 'redux'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { v4 as uuidv4 } from 'uuid'
import omit from 'lodash/omit'
import { RootState } from './state'
import { InternalActionTypes } from './actions/InternalActionTypes'
import { AddNotificationPayload, changeNotification, RemoveNotificationPayload } from './actions/clientActions'
import {uuid4} from "@sentry/utils";

let timeouts: {
    [id: string]: any
} = {}

const notificationMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    RootState
> = (storeApi) => (next) => (action) => {
    const { dispatch } = storeApi
    const prevState = storeApi.getState()
    switch (action.type) {
        case InternalActionTypes.ADD_NOTIFICATION: {
            const notification = action.payload as AddNotificationPayload
            if (!notification.permanent && notification.featured) {
                timeouts = {
                    ...timeouts,
                    [notification.id]: setTimeout(() => {
                        dispatch(
                            changeNotification({
                                id: notification.id,
                                featured: false,
                            })
                        )
                    }, notification.featureTimeout || 3000),
                }
            }
            break
        }
        case InternalActionTypes.REMOVE_NOTIFICATION: {
            const id = action.payload as RemoveNotificationPayload
            if (timeouts[id]) {
                clearTimeout(timeouts[id])
                timeouts = omit(timeouts, id)
            }
            break
        }
        case ServerDeviceEvents.ChatMessageSend: {
            // Resolve username
            const chatMessage = action.payload as ServerDevicePayloads.ChatMessageSend
            const isSelf =
                prevState.globals.localStageDeviceId &&
                prevState.globals.localStageDeviceId === chatMessage.stageMemberId
            if(!isSelf) {
                const userId = prevState.stageMembers.byId[chatMessage.stageMemberId]?.userId
                const user = userId ? prevState.users.byId[userId] : undefined
                dispatch(
                  addNotificationAction({
                      id: uuid4(),
                      date: new Date().getTime(),
                      kind: 'info',
                      message: `${user?.name || chatMessage.stageMemberId}: ${chatMessage.message}`,
                      link: '/chat',
                      permanent: false,
                      featured: true,
                      featureTimeout: (3000 + (chatMessage.message.split(" ").length * 400))
                  })
                )
            }
            break
        }
    }
    return next(action)
}

export { notificationMiddleware }
function addNotificationAction(arg0: { id: any; date: number; kind: string; message: string; link: string; permanent: boolean; featured: boolean; featureTimeout: number }): any {
    throw new Error('Function not implemented.')
}


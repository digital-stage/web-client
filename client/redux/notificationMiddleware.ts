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

import { Middleware } from 'redux'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { v4 as uuidv4 } from 'uuid'
import omit from 'lodash/omit'
import { InternalActionTypes } from './actions/InternalActionTypes'
import {addNotification, AddNotificationPayload, changeNotification, RemoveNotificationPayload } from './actions/clientActions'
import { RootState } from './RootState'

let timeouts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [id: string]: any
} = {}

const notificationMiddleware: Middleware<
    unknown, // Most middleware do not modify the dispatch return value
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
        case ServerDeviceEvents.StageJoined: {
          // Check if the local stage device has an valid order needed for ov clients
          // Otherwise inform user
          const { stageDevices } =
            action.payload as ServerDevicePayloads.StageJoined
          if(prevState.globals.localDeviceId) {
            const localStageDevice = stageDevices.find(
              (stageDevice) => stageDevice.deviceId === prevState.globals.localDeviceId
            )
            if(localStageDevice?.order === -1) {
              dispatch(
                addNotification({
                  id: uuidv4(),
                  date: new Date().getTime(),
                  kind: 'info',
                  message: `The number of ov clients per stage exceeded and you won't be able to share or receive audio`,
                  permanent: true,
                  featured: true,
                })
              )
            }
          }
          break;
        }
        case ServerDeviceEvents.ChatMessageSend: {
            // Resolve username
            const chatMessage = action.payload as ServerDevicePayloads.ChatMessageSend
            if(prevState.globals.stageMemberId !== chatMessage.stageMemberId) {
                const userId = prevState.stageMembers.byId[chatMessage.stageMemberId]?.userId
                const user = userId ? prevState.users.byId[userId] : undefined
                dispatch(
                  addNotification({
                      id: uuidv4(),
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


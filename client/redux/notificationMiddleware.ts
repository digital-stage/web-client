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

import {AnyAction, Dispatch, Middleware} from 'redux'
import {ServerDeviceEvents, ServerDevicePayloads} from '@digitalstage/api-types'
import {v4 as uuidv4} from 'uuid'
import omit from 'lodash/omit'
import {InternalActionTypes} from './actions/InternalActionTypes'
import {
  addNotification,
  AddNotificationPayload,
  changeNotification,
  RemoveNotificationPayload,
  setCheck
} from './actions/clientActions'
import {RootState} from './RootState'

let timeouts: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [id: string]: any
} = {}

const validateOvConfiguration = (state: RootState, dispatch: Dispatch<AnyAction>): void => {
  // Has the current stage device a valid ov order ID?
  const hasOvDeviceOrderId = state.globals.localStageDeviceId ?
    state.stageDevices.byId[state.globals.localStageDeviceId].order !== -1 : false
  dispatch(setCheck({
    isOvRunning: state.devices.allIds.some(id => state.devices.byId[id].online && state.devices.byId[id].type === "ov"),
    hasOvDeviceOrderId: hasOvDeviceOrderId
  }));
}

const validateJammerConfiguration = (state: RootState, dispatch: Dispatch<AnyAction>): void => {
  // Has this user at least one active jammer client running?
  dispatch(setCheck({
    isJammerRunning: state.devices.allIds.some(id => state.devices.byId[id].online && state.devices.byId[id].type === "jammer")
  }));
}

const notificationMiddleware: Middleware<unknown, // Most middleware do not modify the dispatch return value
  RootState> = (storeApi) => (next) => (action) => {
  const {dispatch} = storeApi

  // BEFORE
  const prevState = storeApi.getState()
  switch (action.type) {
    case InternalActionTypes.ADD_NOTIFICATION: {
      const notification = action.payload as AddNotificationPayload
      if (notification.featureTimeout != undefined && notification.featured) {
        timeouts = {
          ...timeouts,
          [notification.id]: setTimeout(() => {
            dispatch(
              changeNotification({
                id: notification.id,
                featured: false,
              })
            )
          }, notification.featureTimeout),
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
      if (prevState.globals.stageMemberId !== chatMessage.stageMemberId) {
        const userId = prevState.stageMembers.byId[chatMessage.stageMemberId]?.userId
        const user = userId ? prevState.users.byId[userId] : undefined
        dispatch(
          addNotification({
            id: uuidv4(),
            date: new Date().getTime(),
            kind: 'info',
            message: `${user?.name || chatMessage.stageMemberId}: ${chatMessage.message}`,
            link: '/chat',
            closeable: true,
            featured: true,
            featureTimeout: (3000 + (chatMessage.message.split(" ").length * 400))
          })
        )
      }
      break
    }
  }

  const res = next(action)
  const state = storeApi.getState()
  // AFTER
  switch (action.type) {
    case ServerDeviceEvents.DeviceAdded: {
      validateJammerConfiguration(state, dispatch)
      validateOvConfiguration(state, dispatch)
      break;
    }
    case ServerDeviceEvents.DeviceRemoved: {
      validateJammerConfiguration(state, dispatch)
      validateOvConfiguration(state, dispatch)
      break;
    }
  }
  return res
}

export {notificationMiddleware}


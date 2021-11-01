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

import {BrowserDevice, ServerDeviceEvents, ServerDevicePayloads} from '@digitalstage/api-types'
import {Globals} from '../state/Globals'
import {InternalActionTypes} from '../actions/InternalActionTypes'
import {ReducerAction} from '../actions/ReducerAction'

function reduceGlobals(
  state: Globals = {
    ready: false,
    selectedMode: 'personal',
    stageId: undefined,
    groupId: undefined,
    localDeviceId: undefined,
    localUserId: undefined,
  },
  action: ReducerAction
): Globals {
  switch (action.type) {
    case InternalActionTypes.RESET: {
      return {
        ...state,
        ready: false,
        selectedDeviceId: undefined,
        stageId: undefined,
        stageMemberId: undefined,
        groupId: undefined,
        localDeviceId: undefined,
        localStageDeviceId: undefined,
        localUserId: undefined,
        turn: undefined
      }
    }
    case InternalActionTypes.SET_ENV: {
      const payload = action.payload as {
        apiUrl: string,
        authUrl: string,
        jnUrl: string,
        logUrl?: string
      }
      return {
        ...state,
        apiUrl: payload.apiUrl,
        authUrl: payload.authUrl,
        jnUrl: payload.jnUrl,
        logUrl: payload.logUrl
      }
    }
    case ServerDeviceEvents.Ready: {
      const payload = action.payload as ServerDevicePayloads.Ready
      return {
        ...state,
        ...payload,
        ready: true,
      }
    }
    case InternalActionTypes.REQUEST_JOIN: {
      return {
        ...state,
        request: action.payload,
      }
    }
    case InternalActionTypes.SELECT_DEVICE: {
      if (action.payload === undefined) {
        return {
          ...state,
          selectedDeviceId: state.localDeviceId,
        }
      }
      return {
        ...state,
        selectedDeviceId: action.payload,
      }
    }
    case InternalActionTypes.SELECT_MODE: {
      return {
        ...state,
        selectedMode: action.payload,
      }
    }
    case ServerDeviceEvents.TurnServersChanged: {
      const payload = action.payload as ServerDevicePayloads.TurnServersChanged
      return {
        ...state,
        turn: {
          ...state.turn,
          urls: payload
        }
      }
    }
    case ServerDeviceEvents.StageJoined: {
      const {stageId, groupId, stageDevices, stageMemberId} =
        action.payload as ServerDevicePayloads.StageJoined
      if (state.localDeviceId) {
        const localStageDevice = stageDevices.find(
          (stageDevice) => stageDevice.deviceId === state.localDeviceId
        )
        if (localStageDevice) {
          return {
            ...state,
            stageId,
            groupId,
            stageMemberId,
            localStageDeviceId: localStageDevice._id,
          }
        }
      }
      return {
        ...state,
        stageId,
        groupId,
        stageMemberId,
      }
    }
    case ServerDeviceEvents.StageLeft:
      return {
        ...state,
        stageId: undefined,
        groupId: undefined,
        stageMemberId: undefined,
        localStageDeviceId: undefined,
      }
    case ServerDeviceEvents.UserReady:
      return {
        ...state,
        localUserId: action.payload._id,
      }
    case ServerDeviceEvents.UserRemoved:
      if (
        state.localUserId &&
        state.localUserId === (action.payload as ServerDevicePayloads.UserRemoved)
      )
        return {
          ...state,
          localUserId: undefined,
        }
      return state
    case ServerDeviceEvents.LocalDeviceReady: {
      // Store cookie of uuid
      const payload = action.payload as ServerDevicePayloads.LocalDeviceReady as BrowserDevice
      return {
        ...state,
        localDeviceId: payload._id,
        selectedDeviceId: state.selectedDeviceId ? state.selectedDeviceId : payload._id,
      }
    }
    default: {
      return state
    }
  }
}

export {reduceGlobals}

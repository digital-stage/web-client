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

import {Producer} from 'mediasoup-client/lib/Producer'
import {Consumer} from 'mediasoup-client/lib/Consumer'
import {v4 as uuidv4} from 'uuid'
import {Notification} from '../state/Notifications'
import {AuthUser} from '../state/Auth'
import {ReducerAction} from './ReducerAction'
import {InternalActionTypes} from './InternalActionTypes'

export const init = (): ReducerAction => ({
  type: InternalActionTypes.INIT,
})

export const reset = (): ReducerAction => ({
  type: InternalActionTypes.RESET,
})

export const selectMode = (mode: 'global' | 'personal'): ReducerAction => ({
  type: InternalActionTypes.SELECT_MODE,
  payload: mode,
})

export const requestJoin = (payload?: {
  stageId: string
  groupId?: string
  password?: string | null
}): ReducerAction => ({
  type: InternalActionTypes.REQUEST_JOIN,
  payload,
})

export const selectDevice = (deviceId: string): ReducerAction => ({
  type: InternalActionTypes.SELECT_DEVICE,
  payload: deviceId,
})

export const addMediasoupVideoProducer = (id: string, producer: Producer): ReducerAction => ({
  type: InternalActionTypes.ADD_MEDIASOUP_VIDEO_PRODUCER,
  payload: {
    id,
    producer,
  },
})
export const removeMediasoupVideoProducer = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_PRODUCER,
  payload: id,
})
export const addMediasoupAudioProducer = (id: string, producer: Producer): ReducerAction => ({
  type: InternalActionTypes.ADD_MEDIASOUP_AUDIO_PRODUCER,
  payload: {
    id,
    producer,
  },
})
export const removeMediasoupAudioProducer = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_PRODUCER,
  payload: id,
})
export const addMediasoupVideoConsumer = (id: string, consumer: Consumer): ReducerAction => ({
  type: InternalActionTypes.ADD_MEDIASOUP_VIDEO_CONSUMER,
  payload: {
    id,
    consumer,
  },
})
export const removeMediasoupVideoConsumer = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_CONSUMER,
  payload: id,
})
export const addMediasoupAudioConsumer = (id: string, consumer: Consumer): ReducerAction => ({
  type: InternalActionTypes.ADD_MEDIASOUP_AUDIO_CONSUMER,
  payload: {
    id,
    consumer,
  },
})
export const removeMediasoupAudioConsumer = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_CONSUMER,
  payload: id,
})

/* WebRTC related */
export const setLocalWebRTCVideoTracks = (tracks: {
  [trackId: string]: MediaStreamTrack
}): ReducerAction => ({
  type: InternalActionTypes.SET_LOCAL_WEBRTC_VIDEO_TRACKS,
  payload: tracks,
})

export const setLocalWebRTCAudioTracks = (tracks: {
  [trackId: string]: MediaStreamTrack
}): ReducerAction => ({
  type: InternalActionTypes.SET_LOCAL_WEBRTC_AUDIO_TRACKS,
  payload: tracks,
})

export const addRemoteWebRTCVideoTrack = (track: MediaStreamTrack): ReducerAction => ({
  type: InternalActionTypes.ADD_REMOTE_WEBRTC_VIDEO_TRACK,
  payload: track,
})

export const removeRemoteWebRTCVideoTrack = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_REMOTE_WEBRTC_VIDEO_TRACK,
  payload: id,
})

export const addRemoteWebRTCAudioTrack = (track: MediaStreamTrack): ReducerAction => ({
  type: InternalActionTypes.ADD_REMOTE_WEBRTC_AUDIO_TRACK,
  payload: track,
})

export const removeRemoteWebRTCAudioTrack = (id: string): ReducerAction => ({
  type: InternalActionTypes.REMOVE_REMOTE_WEBRTC_AUDIO_TRACK,
  payload: id,
})

/* Notificatons */
type AddNotificationPayload = Notification
type SetCheckPayload = { [description: string]: boolean }
type ChangeNotificationPayload = { id: string } & Partial<Notification>
type RemoveNotificationPayload = string

export const addNotification = (init: AddNotificationPayload): ReducerAction => ({
  type: InternalActionTypes.ADD_NOTIFICATION,
  payload: init,
})

export const setCheck = (payload: SetCheckPayload): ReducerAction => ({
  type: InternalActionTypes.SET_CHECK,
  payload: payload,
})

export const changeNotification = (update: ChangeNotificationPayload): ReducerAction => ({
  type: InternalActionTypes.CHANGE_NOTIFICATION,
  payload: update,
})

export const removeNotification = (id: RemoveNotificationPayload): ReducerAction => ({
  type: InternalActionTypes.REMOVE_NOTIFICATION,
  payload: id,
})

export const reportError = (error: Error, stack?: string): ReducerAction =>
  addNotification({
    id: uuidv4(),
    date: new Date().getTime(),
    kind: 'error',
    message: `${error.name}: ${error.message}`,
    stack,
    closeable: true,
    featured: true,
  })

export const setEnvironment = (apiUrl: string, authUrl: string, jnUrl: string, logUrl?: string): ReducerAction => ({
  type: InternalActionTypes.SET_ENV,
  payload: {
    apiUrl: apiUrl,
    authUrl: authUrl,
    jnUrl: jnUrl,
    logUrl: logUrl
  },
})

export const setInitialized = (initialized: boolean): ReducerAction => ({
  type: InternalActionTypes.SET_INITIALIZED,
  payload: initialized,
})

export const setUser = (user?: AuthUser): ReducerAction => ({
  type: InternalActionTypes.SET_USER,
  payload: user,
})

export const setToken = (token?: string, staySignedIn?: boolean): ReducerAction => ({
  type: InternalActionTypes.SET_TOKEN,
  payload: {
    token,
    staySignedIn,
  },
})

export type {
  AddNotificationPayload, SetCheckPayload, ChangeNotificationPayload, RemoveNotificationPayload
}
const clientActions = {
  init,
  reset,

  setEnvironment,

  /* Stage management */
  requestJoin,

  /* Auth management */
  setInitialized,
  setUser,
  setToken,

  /* Selection of mode and device */
  selectMode,
  selectDevice,

  /* Mediasoup related */
  addMediasoupAudioConsumer,
  removeMediasoupAudioConsumer,
  addMediasoupAudioProducer,
  removeMediasoupAudioProducer,
  addMediasoupVideoProducer,
  removeMediasoupVideoProducer,
  addMediasoupVideoConsumer,
  removeMediasoupVideoConsumer,

  /* WebRTC related */
  setLocalWebRTCAudioTracks,
  setLocalWebRTCVideoTracks,
  addRemoteWebRTCVideoTrack,
  removeRemoteWebRTCVideoTrack,
  addRemoteWebRTCAudioTrack,
  removeRemoteWebRTCAudioTrack,

  /* Notifications (handled by useReport) */
  addNotification,
  setCheck,
  changeNotification,
  removeNotification,
}

export {clientActions}

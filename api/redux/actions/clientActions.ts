import { InternalActionTypes } from '@digitalstage/api-client-react'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { Notification } from '../state/Notifications'
import { AuthUser } from '../state/Auth'
import ReducerAction from './ReducerAction'
import { ITeckosClient } from 'teckos-client'

export const reset = (): ReducerAction => ({
    type: InternalActionTypes.RESET,
})

export const selectMode = (mode: 'global' | 'personal'): ReducerAction => ({
    type: InternalActionTypes.SELECT_MODE,
    payload: mode,
})

export const selectDevice = (deviceId: string): ReducerAction => ({
    type: InternalActionTypes.SELECT_DEVICE,
    payload: deviceId,
})

export const addMediasoupVideoProducer = (id: string, producer: Producer) => ({
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
export const setWebRTCDescription = (
    fromStageDeviceId: string,
    description: RTCSessionDescriptionInit
): ReducerAction => ({
    type: InternalActionTypes.SET_DESCRIPTION,
    payload: {
        fromStageDeviceId,
        description,
    },
})
export const setWebRTCCandidate = (
    fromStageDeviceId: string,
    candidate: RTCIceCandidate
): ReducerAction => ({
    type: InternalActionTypes.SET_CANDIDATE,
    payload: {
        fromStageDeviceId,
        candidate,
    },
})
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

/* Audio related */
export const setAudioStarted = (started?: boolean): ReducerAction => ({
    type: InternalActionTypes.SET_AUDIO_STARTED,
    payload: started,
})
export const addLevel = (uuid: string, level: ArrayBuffer): ReducerAction => ({
    type: InternalActionTypes.ADD_LEVEL,
    payload: {
        uuid: uuid,
        level: level,
    },
})
export const removeLevel = (uuid: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_LEVEL,
    payload: uuid,
})

/* Notificatons */
type AddNotificationPayload = Notification
type ChangeNotificationPayload = { id: string } & Partial<Notification>
type RemoveNotificationPayload = string

export const addNotification = (init: AddNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.ADD_NOTIFICATION,
    payload: init,
})

export const changeNotification = (update: ChangeNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.CHANGE_NOTIFICATION,
    payload: update,
})

export const removeNotification = (id: RemoveNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.REMOVE_NOTIFICATION,
    payload: id,
})

export const setInitialized = (initialized: boolean): ReducerAction => ({
    type: InternalActionTypes.SET_INITIALIZED,
    payload: initialized,
})

export const connect = (token?: string): ReducerAction => ({
    type: InternalActionTypes.CONNECT,
    payload: token,
})
export const disconnect = (): ReducerAction => ({
    type: InternalActionTypes.DISCONNECT,
})
/*
I know, storing a whole connection object seems ruff. But the alternative is React Context API.
And this would lead to a */

export const setConnection = (connection?: ITeckosClient): ReducerAction => ({
    type: InternalActionTypes.SET_CONNECTION,
    payload: connection,
})

export const setUser = (user?: AuthUser): ReducerAction => ({
    type: InternalActionTypes.SET_USER,
    payload: user,
})

export const setToken = (token?: string): ReducerAction => ({
    type: InternalActionTypes.SET_TOKEN,
    payload: token,
})

export type { AddNotificationPayload, ChangeNotificationPayload, RemoveNotificationPayload }
const clientActions = {
    reset,

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
    changeNotification,
    removeNotification,

    /* Audio management */
    addLevel,
    removeLevel,
    setAudioStarted,
}

export default clientActions

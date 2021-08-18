import { InternalActionTypes } from '@digitalstage/api-client-react'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { Notification } from '../state/Notifications'
import { AuthUser } from '../state/Auth'
import ReducerAction from './ReducerAction'
import {ActionCreator} from 'redux'

export const reset: ActionCreator<ReducerAction> = (): ReducerAction => ({
    type: InternalActionTypes.RESET,
})

export const selectMode: ActionCreator<ReducerAction> = (mode: 'global' | 'personal'): ReducerAction => ({
    type: InternalActionTypes.SELECT_MODE,
    payload: mode,
})

export const selectDevice: ActionCreator<ReducerAction>= (deviceId: string): ReducerAction => ({
    type: InternalActionTypes.SELECT_DEVICE,
    payload: deviceId,
})

export const addMediasoupVideoProducer: ActionCreator<ReducerAction> = (id: string, producer: Producer): ReducerAction => ({
    type: InternalActionTypes.ADD_MEDIASOUP_VIDEO_PRODUCER,
    payload: {
        id,
        producer,
    },
})
export const removeMediasoupVideoProducer: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_PRODUCER,
    payload: id,
})
export const addMediasoupAudioProducer: ActionCreator<ReducerAction> = (id: string, producer: Producer): ReducerAction => ({
    type: InternalActionTypes.ADD_MEDIASOUP_AUDIO_PRODUCER,
    payload: {
        id,
        producer,
    },
})
export const removeMediasoupAudioProducer: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_PRODUCER,
    payload: id,
})
export const addMediasoupVideoConsumer: ActionCreator<ReducerAction> = (id: string, consumer: Consumer): ReducerAction => ({
    type: InternalActionTypes.ADD_MEDIASOUP_VIDEO_CONSUMER,
    payload: {
        id,
        consumer,
    },
})
export const removeMediasoupVideoConsumer: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_CONSUMER,
    payload: id,
})
export const addMediasoupAudioConsumer: ActionCreator<ReducerAction> = (id: string, consumer: Consumer): ReducerAction => ({
    type: InternalActionTypes.ADD_MEDIASOUP_AUDIO_CONSUMER,
    payload: {
        id,
        consumer,
    },
})
export const removeMediasoupAudioConsumer: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_CONSUMER,
    payload: id,
})

/* WebRTC related */
export const setWebRTCDescription: ActionCreator<ReducerAction> = (
    fromStageDeviceId: string,
    description: RTCSessionDescriptionInit
): ReducerAction => ({
    type: InternalActionTypes.SET_DESCRIPTION,
    payload: {
        fromStageDeviceId,
        description,
    },
})
export const setWebRTCCandidate: ActionCreator<ReducerAction> = (
    fromStageDeviceId: string,
    candidate: RTCIceCandidate
): ReducerAction => ({
    type: InternalActionTypes.SET_CANDIDATE,
    payload: {
        fromStageDeviceId,
        candidate,
    },
})
export const setLocalWebRTCVideoTracks: ActionCreator<ReducerAction> = (tracks: {
    [trackId: string]: MediaStreamTrack
}): ReducerAction => ({
    type: InternalActionTypes.SET_LOCAL_WEBRTC_VIDEO_TRACKS,
    payload: tracks,
})

export const setLocalWebRTCAudioTracks: ActionCreator<ReducerAction> = (tracks: {
    [trackId: string]: MediaStreamTrack
}): ReducerAction => ({
    type: InternalActionTypes.SET_LOCAL_WEBRTC_AUDIO_TRACKS,
    payload: tracks,
})

export const addRemoteWebRTCVideoTrack: ActionCreator<ReducerAction> = (track: MediaStreamTrack): ReducerAction => ({
    type: InternalActionTypes.ADD_REMOTE_WEBRTC_VIDEO_TRACK,
    payload: track,
})

export const removeRemoteWebRTCVideoTrack: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_REMOTE_WEBRTC_VIDEO_TRACK,
    payload: id,
})

export const addRemoteWebRTCAudioTrack: ActionCreator<ReducerAction> = (track: MediaStreamTrack): ReducerAction => ({
    type: InternalActionTypes.ADD_REMOTE_WEBRTC_AUDIO_TRACK,
    payload: track,
})

export const removeRemoteWebRTCAudioTrack: ActionCreator<ReducerAction> = (id: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_REMOTE_WEBRTC_AUDIO_TRACK,
    payload: id,
})

/* Audio related */
export const setAudioStarted: ActionCreator<ReducerAction> = (started?: boolean): ReducerAction => ({
    type: InternalActionTypes.SET_AUDIO_STARTED,
    payload: started,
})
export const addLevel: ActionCreator<ReducerAction> = (uuid: string, level: ArrayBuffer): ReducerAction => ({
    type: InternalActionTypes.ADD_LEVEL,
    payload: {
        uuid: uuid,
        level: level,
    },
})
export const removeLevel: ActionCreator<ReducerAction> = (uuid: string): ReducerAction => ({
    type: InternalActionTypes.REMOVE_LEVEL,
    payload: uuid,
})

/* Notificatons */
type AddNotificationPayload = Notification
type ChangeNotificationPayload = { id: string } & Partial<Notification>
type RemoveNotificationPayload = string

export const addNotification: ActionCreator<ReducerAction> = (init: AddNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.ADD_NOTIFICATION,
    payload: init,
})

export const changeNotification: ActionCreator<ReducerAction> = (update: ChangeNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.CHANGE_NOTIFICATION,
    payload: update,
})

export const removeNotification: ActionCreator<ReducerAction> = (id: RemoveNotificationPayload): ReducerAction => ({
    type: InternalActionTypes.REMOVE_NOTIFICATION,
    payload: id,
})

export const setInitialized: ActionCreator<ReducerAction> = (initialized: boolean): ReducerAction => ({
    type: InternalActionTypes.SET_INITIALIZED,
    payload: initialized,
})

export const setUser: ActionCreator<ReducerAction> = (user?: AuthUser): ReducerAction => ({
    type: InternalActionTypes.SET_USER,
    payload: user,
})

export const setToken: ActionCreator<ReducerAction> = (token?: string): ReducerAction => ({
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

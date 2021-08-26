import WebRTC from '../state/WebRTC'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import omit from 'lodash/omit'

function reduceWebRTC(
    prev: WebRTC = {
        descriptions: {},
        candidates: {},
        remoteVideoTracks: {},
        remoteAudioTracks: {},
        localVideoTracks: {},
        localAudioTracks: {},
    },
    action: {
        type: string
        payload: any
    }
): WebRTC {
    switch (action.type) {
        case InternalActionTypes.SET_DESCRIPTION: {
            const { fromStageDeviceId, description } = action.payload as {
                fromStageDeviceId: string
                description: RTCSessionDescriptionInit
            }
            return {
                ...prev,
                descriptions: {
                    ...prev.descriptions,
                    [fromStageDeviceId]: description,
                },
            }
        }
        case InternalActionTypes.SET_CANDIDATE: {
            const { fromStageDeviceId, candidate } = action.payload as {
                fromStageDeviceId: string
                candidate: RTCIceCandidate
            }
            return {
                ...prev,
                candidates: {
                    ...prev.candidates,
                    [fromStageDeviceId]: candidate,
                },
            }
        }
        case InternalActionTypes.SET_LOCAL_WEBRTC_AUDIO_TRACKS: {
            const payload = action.payload as {
                [trackId: string]: MediaStreamTrack
            }
            return {
                ...prev,
                localAudioTracks: payload,
            }
        }
        case InternalActionTypes.SET_LOCAL_WEBRTC_VIDEO_TRACKS: {
            const payload = action.payload as {
                [trackId: string]: MediaStreamTrack
            }
            return {
                ...prev,
                localVideoTracks: payload,
            }
        }
        case InternalActionTypes.ADD_REMOTE_WEBRTC_AUDIO_TRACK: {
            const track = action.payload as MediaStreamTrack
            return {
                ...prev,
                remoteAudioTracks: {
                    [track.id]: track,
                },
            }
        }
        case InternalActionTypes.REMOVE_REMOTE_WEBRTC_AUDIO_TRACK: {
            const id = action.payload as string
            return {
                ...prev,
                remoteAudioTracks: omit(prev.remoteAudioTracks, id),
            }
        }
        case InternalActionTypes.ADD_REMOTE_WEBRTC_VIDEO_TRACK: {
            const track = action.payload as MediaStreamTrack
            return {
                ...prev,
                remoteVideoTracks: {
                    [track.id]: track,
                },
            }
        }
        case InternalActionTypes.REMOVE_REMOTE_WEBRTC_VIDEO_TRACK: {
            const id = action.payload as string
            return {
                ...prev,
                remoteVideoTracks: omit(prev.remoteVideoTracks, id),
            }
        }
        default:
            return prev
    }
}

export default reduceWebRTC

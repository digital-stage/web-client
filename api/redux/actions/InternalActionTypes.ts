enum InternalActionTypes {
    NEXT_INIT = '@@INIT',

    SET_INITIALIZED = 'set-initialized',

    CONNECT = 'connect',
    DISCONNECT = 'disconnect',
    SET_CONNECTION = 'set-connection',

    RESET = 'reset',

    SELECT_DEVICE = 'select-device',
    SELECT_MODE = 'select-mode',
    SET_USER = 'set-user',
    SET_TOKEN = 'set-token',
    LOGOUT = 'logout',

    // Notification states
    ADD_NOTIFICATION = 'add-notification',
    CHANGE_NOTIFICATION = 'change-notification',
    REMOVE_NOTIFICATION = 'remove-notification',

    // AUDIO
    SET_AUDIO_STARTED = 'set-audio-started',
    ADD_LEVEL = 'add-level',
    REMOVE_LEVEL = 'remove-level',

    // Mediasoup
    SET_MEDIASOUP_CONNECTED = 'set-mediasoup-connected',
    ADD_MEDIASOUP_VIDEO_CONSUMER = 'add-mediasoup-video-consumer',
    REMOVE_MEDIASOUP_VIDEO_CONSUMER = 'remove-mediasoup-video-consumer',
    ADD_MEDIASOUP_AUDIO_CONSUMER = 'add-mediasoup-audio-consumer',
    REMOVE_MEDIASOUP_AUDIO_CONSUMER = 'remove-mediasoup-audio-consumer',
    ADD_MEDIASOUP_VIDEO_PRODUCER = 'add-mediasoup-video-producer',
    REMOVE_MEDIASOUP_VIDEO_PRODUCER = 'remove-mediasoup-video-producer',
    ADD_MEDIASOUP_AUDIO_PRODUCER = 'add-mediasoup-audio-producer',
    REMOVE_MEDIASOUP_AUDIO_PRODUCER = 'remove-mediasoup-audio-producer',

    // Webrtc
    SET_DESCRIPTION = 'add-offer',
    SET_CANDIDATE = 'add-ice-candidate',
    SET_LOCAL_WEBRTC_VIDEO_TRACKS = 'set-local-webrtc-video-tracks',
    SET_LOCAL_WEBRTC_AUDIO_TRACKS = 'set-local-webrtc-audio-tracks',
    ADD_REMOTE_WEBRTC_VIDEO_TRACK = 'add-remote-webrtc-video-track',
    REMOVE_REMOTE_WEBRTC_VIDEO_TRACK = 'remove-remote-webrtc-video-track',
    ADD_REMOTE_WEBRTC_AUDIO_TRACK = 'add-remote-webrtc-audio-track',
    REMOVE_REMOTE_WEBRTC_AUDIO_TRACK = 'remove-remote-webrtc-audio-track',
}

export default InternalActionTypes

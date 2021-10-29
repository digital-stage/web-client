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

enum InternalActionTypes {
    SET_ENV = 'env',

    INIT = 'init',
    RESET = 'reset',

    // Device selection
    SELECT_DEVICE = 'select-device',
    SELECT_MODE = 'select-mode',

    // Auth management
    SET_INITIALIZED = 'set-initialized',
    SET_USER = 'set-user',
    SET_TOKEN = 'set-token',
    LOGOUT = 'logout',

    // Stage Management
    REQUEST_JOIN = 'request-join',

    // Notification states
    ADD_NOTIFICATION = 'add-notification',
    SET_CHECK = 'set-check',
    CHANGE_NOTIFICATION = 'change-notification',
    REMOVE_NOTIFICATION = 'remove-notification',

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

export { InternalActionTypes }

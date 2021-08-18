interface WebRTC {
    descriptions: {
        [fromStageDeviceId: string]: RTCSessionDescriptionInit
    }
    candidates: {
        [fromStageDeviceId: string]: RTCIceCandidate
    }
    remoteVideoTracks: {
        [trackId: string]: MediaStreamTrack
    }
    remoteAudioTracks: {
        [trackId: string]: MediaStreamTrack
    }
    localVideoTracks: {
        [trackId: string]: MediaStreamTrack
    }
    localAudioTracks: {
        [trackId: string]: MediaStreamTrack
    }
}

export default WebRTC

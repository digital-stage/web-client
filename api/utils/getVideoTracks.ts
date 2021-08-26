const getVideoTracks = (inputVideoDeviceId?: string): Promise<MediaStreamTrack[]> =>
    navigator.mediaDevices
        .getUserMedia({
            audio: false,
            video: inputVideoDeviceId
                ? {
                      deviceId: inputVideoDeviceId,
                      width: { max: 640 },
                      height: { max: 640 },
                  }
                : {
                      width: { max: 640 },
                      height: { max: 640 },
                  },
        })
        .then((stream) => stream.getVideoTracks())
export { getVideoTracks }

export type AudioOptions = {
  deviceId: string,
  sampleRate: number,
  autoGainControl: boolean,
  echoCancellation: boolean,
  noiseSuppression: boolean,
}

const getAudioTrack = ({
                         autoGainControl,
                         echoCancellation,
                         deviceId,
                         noiseSuppression,
                         sampleRate,
                       }: AudioOptions): Promise<MediaStreamTrack> => {
  return navigator.mediaDevices
    .getUserMedia({
      video: false,
      audio: {
        deviceId: deviceId,
        sampleRate: sampleRate,
        autoGainControl: autoGainControl,
        echoCancellation: echoCancellation,
        noiseSuppression: noiseSuppression,
      } as any,
    })
    .then((stream) => stream.getAudioTracks().pop())
    .then(async track => {
      const capabilities = track.getCapabilities()
      if (capabilities.latency && capabilities.latency.min) {
        await track.applyConstraints({
          latency: capabilities.latency.min
        })
      }
      return track
    })
}
export {getAudioTrack}

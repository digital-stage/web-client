const getAudioTracks = (options: {
    inputAudioDeviceId?: string
    sampleRate?: number
    autoGainControl?: boolean
    echoCancellation?: boolean
    noiseSuppression?: boolean
}): Promise<MediaStreamTrack[]> => {
    const audioOptions = {
        deviceId: options.inputAudioDeviceId || undefined,
        sampleRate: options.sampleRate || undefined,
        autoGainControl: options.autoGainControl || false,
        echoCancellation: options.echoCancellation || false,
        noiseSuppression: options.noiseSuppression || false,
    }
    return navigator.mediaDevices
        .getUserMedia({
            video: false,
            audio: audioOptions,
        })
        .then((stream) => stream.getAudioTracks())
}
export default getAudioTracks

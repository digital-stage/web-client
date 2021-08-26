import { AudioContext as StandardizedAudioContext, IAudioContext } from 'standardized-audio-context'

/**
 * Create audio buffer with fallback for safari
 */
const createBuffer = (sampleRate?: number): IAudioContext => {
    let context = new StandardizedAudioContext({
        latencyHint: 'interactive',
    })
    if (/(iPhone|iPad)/i.test(navigator.userAgent)) {
        const desiredSampleRate: number =
            sampleRate && typeof sampleRate === 'number' ? sampleRate : 44100
        if (context.sampleRate !== desiredSampleRate) {
            const buffer = context.createBuffer(1, 1, desiredSampleRate)
            const dummy = context.createBufferSource()
            dummy.buffer = buffer
            dummy.connect(context.destination)
            dummy.start(0)
            dummy.disconnect()

            context.close() // dispose old context
            context = new StandardizedAudioContext({
                latencyHint: 'interactive',
            })
        }
    }
    return context
}

const startAudioContext = async (
    audioContext: IAudioContext,
    audio: HTMLAudioElement
): Promise<void> => {
    if (audioContext.state === 'suspended') {
        return audioContext.resume().then(() => {
            if (audio.paused) return audio.play()
            return undefined
        })
    }
    return Promise.resolve()
}

export { createBuffer, startAudioContext }

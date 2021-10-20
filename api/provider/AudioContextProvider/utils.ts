
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

/**
 * Create audio buffer with fallback for safari
 */
const createBuffer = (sampleRate?: number): AudioContext => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const AudioContext = window.AudioContext || window.webkitAudioContext
    return new AudioContext({
        latencyHint: 0, // 'interactive',
        sampleRate
    })
    /*
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
                latencyHint: 0// 'interactive',
            })
        }
    }
    return context */
}

const startAudioContext = async (
    audioContext: AudioContext,
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

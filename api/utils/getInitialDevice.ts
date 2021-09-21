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

import { BrowserDevice, WebMediaDevice } from '@digitalstage/api-types'
import * as Bowser from 'bowser'

const getInitialDevice = async (
    permanent: boolean,
    uuid?: string
): Promise<Partial<Omit<BrowserDevice, '_id'>>> => {
    const browser = Bowser.getParser(window.navigator.userAgent)
    if (navigator !== undefined) {
        const inputAudioDevices: WebMediaDevice[] = []
        const outputAudioDevices: WebMediaDevice[] = []
        const inputVideoDevices: WebMediaDevice[] = []
        const devices = await navigator.mediaDevices.enumerateDevices()
        devices.forEach((mediaDevice) => {
            switch (mediaDevice.kind) {
                case 'audioinput': {
                    inputAudioDevices.push({
                        id: mediaDevice.deviceId,
                        label: mediaDevice.label,
                    })
                    break
                }
                case 'audiooutput': {
                    outputAudioDevices.push({
                        id: mediaDevice.deviceId,
                        label: mediaDevice.label,
                    })
                    break
                }
                case 'videoinput': {
                    inputVideoDevices.push({
                        id: mediaDevice.deviceId,
                        label: mediaDevice.label,
                    })
                    break
                }
                default:
                    break
            }
        })
        return {
            uuid,
            requestSession: permanent && !uuid,
            type: 'browser',
            os: browser.getOSName(),
            browser: browser.getBrowserName(),
            inputAudioDevices,
            outputAudioDevices,
            inputVideoDevices,
            canAudio: outputAudioDevices.length > 0 || inputAudioDevices.length > 0,
            canVideo: inputVideoDevices.length > 0,
            receiveAudio: true,
            receiveVideo: true,
        }
    }
    return {
        type: 'node',
        uuid,
        requestSession: permanent && !uuid,
        receiveAudio: true,
    }
}
export { getInitialDevice }

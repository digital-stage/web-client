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
            useP2P: true,
        }
    }
    return {
        type: 'node',
        uuid,
        requestSession: permanent && !uuid,
        receiveAudio: true,
    }
}
export default getInitialDevice

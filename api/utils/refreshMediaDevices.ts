import {ClientDeviceEvents, ClientDevicePayloads, WebMediaDevice} from "@digitalstage/api-types";
import {SocketEvent} from "teckos-client/dist/types";

const enumerateDevices = (): Promise<{
    inputAudioDevices: WebMediaDevice[]
    inputVideoDevices: WebMediaDevice[]
    outputAudioDevices: WebMediaDevice[]
}> =>
    new Promise<{
        inputAudioDevices: WebMediaDevice[]
        inputVideoDevices: WebMediaDevice[]
        outputAudioDevices: WebMediaDevice[]
    }>((resolve) => {
        if (!navigator) {
            return resolve({
                inputAudioDevices: [],
                inputVideoDevices: [],
                outputAudioDevices: [],
            })
        }
        return navigator.mediaDevices.enumerateDevices().then((devices) => {
            const inputVideoDevices: WebMediaDevice[] = []
            const inputAudioDevices: WebMediaDevice[] = []
            const outputAudioDevices: WebMediaDevice[] = []
            devices.forEach((device, index) => {
                switch (device.kind) {
                    case 'videoinput':
                        inputVideoDevices.push({
                            id:
                                device.deviceId ||
                                (inputVideoDevices.length === 1 ? 'default' : index.toString()),
                            label: device.label ? device.label : 'Standard',
                        })
                        break
                    case 'audioinput':
                        inputAudioDevices.push({
                            id:
                                device.deviceId ||
                                (inputAudioDevices.length === 1 ? 'default' : index.toString()),
                            label: device.label || 'Standard',
                        })
                        break
                    default:
                        outputAudioDevices.push({
                            id:
                                device.deviceId ||
                                (outputAudioDevices.length === 1 ? 'default' : index.toString()),
                            label: device.label || 'Standard',
                        })
                        break
                }
            })
            return resolve({
                inputAudioDevices,
                inputVideoDevices,
                outputAudioDevices,
            })
        })
    })

const refreshMediaDevices = (
    deviceId: string,
    inputAudioDevices: WebMediaDevice[],
    inputVideoDevices: WebMediaDevice[],
    outputAudioDevices: WebMediaDevice[],
    emit: (event: SocketEvent, ...args: any[]) => boolean
): Promise<boolean> => {
    return enumerateDevices().then((devices) => {
        // Sync and update if necessary
        let shouldUpdate: boolean = false
        const update: ClientDevicePayloads.ChangeDevice = {_id: deviceId}
        if (inputAudioDevices !== devices.inputAudioDevices) {
            shouldUpdate = true
            update.inputAudioDevices = devices.inputAudioDevices
        }
        if (inputVideoDevices !== devices.inputVideoDevices) {
            shouldUpdate = true
            update.inputVideoDevices = devices.inputVideoDevices
        }
        if (outputAudioDevices !== devices.outputAudioDevices) {
            shouldUpdate = true
            update.outputAudioDevices = devices.outputAudioDevices
        }
        if (shouldUpdate) {
            return emit(ClientDeviceEvents.ChangeDevice, update)
        }
        return false
    })
}
export {refreshMediaDevices}
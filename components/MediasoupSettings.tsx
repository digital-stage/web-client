import { useConnection } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, MediasoupDevice } from '@digitalstage/api-types'

const MediasoupSettings = (props: { device: MediasoupDevice }) => {
    const { device } = props
    const connection = useConnection()
    return (
        <>
            {device.canVideo && (
                <li>
                    Input video:
                    <select
                        value={device.inputVideoDeviceId}
                        onChange={(event) =>
                            connection.emit(ClientDeviceEvents.ChangeDevice, {
                                _id: device._id,
                                inputVideoDeviceId: event.currentTarget.value,
                            })
                        }
                    >
                        {device.inputVideoDevices.map((inputVideoDevice) => (
                            <option key={inputVideoDevice.id} value={inputVideoDevice.id}>
                                {inputVideoDevice.label}
                            </option>
                        ))}
                    </select>
                </li>
            )}
            {device.canAudio && (
                <>
                    <li>
                        Input audio:
                        <select
                            value={device.inputAudioDeviceId}
                            onChange={(event) =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: device._id,
                                    inputAudioDeviceId: event.currentTarget.value,
                                })
                            }
                        >
                            {device.inputAudioDevices.map((inputAudioDevice) => (
                                <option key={inputAudioDevice.id} value={inputAudioDevice.id}>
                                    {inputAudioDevice.label}
                                </option>
                            ))}
                        </select>
                    </li>
                    <li>
                        Output audio:
                        <select
                            value={device.outputAudioDeviceId}
                            onChange={(event) =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: device._id,
                                    outputAudioDeviceId: event.currentTarget.value,
                                })
                            }
                        >
                            {device.outputAudioDevices.map((outputAudioDevice) => (
                                <option key={outputAudioDevice.id} value={outputAudioDevice.id}>
                                    {outputAudioDevice.label}
                                </option>
                            ))}
                        </select>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={device.autoGainControl || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        autoGainControl: event.currentTarget.checked,
                                    })
                                }
                            />
                            autoGainControl
                        </label>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={device.echoCancellation || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        echoCancellation: event.currentTarget.checked,
                                    })
                                }
                            />
                            echoCancellation
                        </label>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={device.noiseSuppression || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        noiseSuppression: event.currentTarget.checked,
                                    })
                                }
                            />
                            noiseSuppression
                        </label>
                    </li>
                </>
            )}
        </>
    )
}
export default MediasoupSettings

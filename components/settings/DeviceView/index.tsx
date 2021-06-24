import { Device, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, MediasoupDevice } from '@digitalstage/api-types'
import React from 'react'
import LiveInput from '../../../fastui/components/interaction/LiveInput'
import Button from '../../../fastui/components/interaction/Button'
import MediasoupSettings from './MediasoupSettings'
import SoundCardSettings from './SoundCardSettings'

const DeviceView = ({ id }: { id: string }) => {
    const connection = useConnection()
    const device = useStageSelector<Device>((state) => state.devices.byId[id])
    if (device) {
        return (
            <>
                <LiveInput
                    onChange={(value) =>
                        connection.emit(ClientDeviceEvents.ChangeDevice, {
                            _id: id,
                            name: value,
                        } as ClientDevicePayloads.ChangeDevice)
                    }
                    label="Name"
                    value={device.name || ''}
                />
                {device.type === 'mediasoup' && (
                    <MediasoupSettings device={device as MediasoupDevice} />
                )}
                {(device.type === 'ov' || device.type === 'jammer') && (
                    <SoundCardSettings deviceId={id} />
                )}

                <ul>
                    {device.canVideo && (
                        <li>
                            Send video:{' '}
                            <Button
                                kind="secondary"
                                onClick={() =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        sendVideo: !device.sendVideo,
                                    })
                                }
                            >
                                {device.sendVideo ? 'YES' : 'NO'}
                            </Button>
                        </li>
                    )}
                    {device.canAudio && (
                        <li>
                            Send audio:{' '}
                            <Button
                                kind="secondary"
                                onClick={() =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        sendAudio: !device.sendAudio,
                                    })
                                }
                            >
                                {device.sendAudio ? 'YES' : 'NO'}
                            </Button>
                        </li>
                    )}
                    {device.canVideo && (
                        <li>
                            Receive video:{' '}
                            <Button
                                kind="secondary"
                                onClick={() =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        receiveVideo: !device.receiveVideo,
                                    })
                                }
                            >
                                {device.receiveVideo ? 'YES' : 'NO'}
                            </Button>
                        </li>
                    )}
                    {device.canAudio && (
                        <li>
                            Receive audio:{' '}
                            <Button
                                kind="secondary"
                                onClick={() =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: device._id,
                                        receiveAudio: !device.receiveAudio,
                                    })
                                }
                            >
                                {device.receiveAudio ? 'YES' : 'NO'}
                            </Button>
                        </li>
                    )}
                </ul>
            </>
        )
    }
    return <>Konnte Gerät nicht finden</>
}

export default DeviceView

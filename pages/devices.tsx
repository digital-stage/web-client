import { Device, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { ClientDeviceEvents, ClientDevicePayloads, MediasoupDevice } from '@digitalstage/api-types'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import LiveInput from '../components/ui/LiveInput'
import SoundCardSelect from '../components/SoundCardSelect'
import Button from '../components/ui/Button'
import MediasoupSettings from '../components/MediasoupSettings'
import Block from '../components/ui/Block'

const DeviceView = ({ id }: { id: string }) => {
    const connection = useConnection()
    const device = useStageSelector<Device>((state) => state.devices.byId[id])
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
                value={device.name}
            />
            {device.type === 'mediasoup' && (
                <MediasoupSettings device={device as MediasoupDevice} />
            )}
            {(device.type === 'ov' || device.type === 'jammer') && (
                <SoundCardSelect deviceId={id} />
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

const Devices = () => {
    const localDeviceId = useStageSelector<string>((state) => state.globals.localDeviceId)
    const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds).filter(
        (id) => id !== localDeviceId
    )
    return (
        <Container>
            <h2>Dieses Gerät</h2>
            <Block vertical width={12} padding={2} paddingBottom={5}>
                {localDeviceId && <DeviceView id={localDeviceId} />}
            </Block>
            <h2>Anderen Geräte</h2>
            <Block width={12} paddingBottom={5}>
                {deviceIds.map((id) => (
                    <Block width={[12, 6]}>
                        <Panel>
                            <DeviceView id={id} />
                        </Panel>
                    </Block>
                ))}
            </Block>
        </Container>
    )
}
export default Devices

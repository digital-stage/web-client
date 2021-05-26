import { Device, useAuth, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads, MediasoupDevice } from '@digitalstage/api-types'
import { useRouter } from 'next/router'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import LiveInput from '../components/ui/LiveInput'
import SoundCardSelect from '../components/SoundCardSelect'
import Button from '../components/ui/Button'
import MediasoupSettings from '../components/MediasoupSettings'
import Block, { Row } from '../components/ui/Block'

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
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])

    const localDeviceId = useStageSelector<string>((state) => state.globals.localDeviceId)
    const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds).filter(
        (id) => id !== localDeviceId
    )
    return (
        <Container>
            <Block vertical paddingTop={4} paddingBottom={5}>
                <h2>Dieses Gerät</h2>
                <Block vertical width={12} padding={2} paddingBottom={5}>
                    {localDeviceId && (
                        <Panel level="level3">
                            <Block padding={4} vertical>
                                <DeviceView id={localDeviceId} />
                            </Block>
                        </Panel>
                    )}
                </Block>
                <h2>Anderen Geräte</h2>
                <Block width={12} paddingBottom={5}>
                    <Row padding={4}>
                        {deviceIds.map((id) => (
                            <Block width={[12, 6]} padding={4}>
                                <Panel>
                                    <Block padding={4} vertical>
                                        <DeviceView id={id} />
                                    </Block>
                                </Panel>
                            </Block>
                        ))}
                    </Row>
                </Block>
            </Block>
        </Container>
    )
}
export default Devices

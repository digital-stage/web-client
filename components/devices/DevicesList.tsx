import { selectDevice, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import styles from './DevicesList.module.scss'
import { shallowEqual, useDispatch } from 'react-redux'
import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import DeleteModal from './DeleteModal'
import { useRouter } from 'next/router'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import List, { ListItem } from '../../ui/List'
import Switch from '../../ui/Switch'
import { MdEdit, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md'
import { GoBrowser, GoDeviceDesktop } from 'react-icons/go'
import { FaRaspberryPi, FaTrash } from 'react-icons/fa'

const TypeNames = {
    jammer: 'Jammer-Client',
    ov: 'ORLANDOviols-Client',
    browser: 'Webbrowser',
}
const TypeIcons = {
    jammer: <GoDeviceDesktop />,
    ov: <FaRaspberryPi />,
    browser: <GoBrowser />,
}

const DeviceEntry = ({
    deviceId,
    localDeviceId,
    onSelect,
    onDeleteClicked,
}: {
    deviceId: string
    localDeviceId: string
    onSelect: () => void
    onDeleteClicked: () => void
}) => {
    const selectedDeviceId = useStageSelector((state) => state.globals.selectedDeviceId)
    const device = useStageSelector((state) => state.devices.byId[deviceId], shallowEqual)
    const selected = useMemo(() => {
        return selectedDeviceId === deviceId
    }, [deviceId, selectedDeviceId])
    const { emit } = useConnection()

    return (
        <ListItem
            onSelect={onSelect}
            selected={selected}
            className={deviceId === localDeviceId && styles.selected}
        >
            <div className={styles.caption}>
                {TypeIcons[device.type]}
                {device.name ||
                    (device.type === 'browser'
                        ? `${device.os}: ${device.browser}`
                        : device._id)}{' '}
                {localDeviceId === device._id ? '(Dieser Webbrowser)' : ''}
            </div>
            <div
                className={styles.actions}
                onClick={(e) => {
                    e.stopPropagation()
                }}
            >
                {device?.type === 'browser' ? (
                    <label className={styles.label}>
                        P2P&nbsp;
                        <Switch
                            size="small"
                            round={true}
                            checked={device.useP2P}
                            onChange={(e) =>
                                emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: device._id,
                                    useP2P: e.currentTarget.checked,
                                } as ClientDevicePayloads.ChangeDevice)
                            }
                        />
                    </label>
                ) : null}
                {device?.canVideo ? (
                    <button
                        className="round secondary small"
                        onClick={() =>
                            emit(ClientDeviceEvents.ChangeDevice, {
                                _id: deviceId,
                                sendVideo: !device.sendVideo,
                            })
                        }
                    >
                        {device.sendVideo ? <MdVideocam /> : <MdVideocamOff />}
                    </button>
                ) : null}
                {device?.canAudio ? (
                    <button
                        onClick={() =>
                            emit(ClientDeviceEvents.ChangeDevice, {
                                _id: deviceId,
                                sendAudio: !device.sendAudio,
                            } as ClientDevicePayloads.ChangeDevice)
                        }
                        className="round small secondary"
                    >
                        {device.sendAudio ? <MdMic /> : <MdMicOff />}
                    </button>
                ) : null}
                <Link href={`/devices/${deviceId}`} passHref>
                    <button className="round small">
                        <MdEdit />
                    </button>
                </Link>
                {!device.online ? (
                    <button className="round small danger" onClick={onDeleteClicked}>
                        <FaTrash />
                    </button>
                ) : undefined}
            </div>
        </ListItem>
    )
}

const DevicesList = () => {
    const deviceIds = useStageSelector((state) => state.devices.allIds)
    const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)
    const dispatch = useDispatch()
    const selectedDeviceId = useStageSelector((state) => state.globals.selectedDeviceId)
    const [deleteRequest, requestDelete] = useState<string>()
    const { push } = useRouter()

    return (
        <List>
            {deviceIds.map((deviceId) => (
                <DeviceEntry
                    key={deviceId}
                    deviceId={deviceId}
                    localDeviceId={localDeviceId}
                    onSelect={() => {
                        if (selectedDeviceId === deviceId) {
                            push(`/devices/${deviceId}`)
                        } else {
                            dispatch(selectDevice(deviceId))
                        }
                    }}
                    onDeleteClicked={() => requestDelete(deviceId)}
                />
            ))}
            <DeleteModal deviceId={deleteRequest} onClose={() => requestDelete(undefined)} />
        </List>
    )
}
export default DevicesList

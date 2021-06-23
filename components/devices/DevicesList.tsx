/* eslint-disable no-nested-ternary */
import { FaRaspberryPi, FaTrash } from 'react-icons/fa'
import { GoBrowser, GoDeviceDesktop } from 'react-icons/go'
import React from 'react'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import useSelectedDevice from '../../lib/useSelectedDevice'
import styles from './DevicesList.module.css'
import Button from '../../ui/Button'

const TypeNames = {
    jammer: 'Jammer-Client',
    ov: 'ORLANDOviols-Client',
    mediasoup: 'Webbrowser',
}
const TypeIcons = {
    jammer: <GoDeviceDesktop />,
    ov: <FaRaspberryPi />,
    mediasoup: <GoBrowser />,
}

const DevicesList = () => {
    const apiConnection = useConnection()
    const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)
    const { selectedDeviceId, selectDeviceId } = useSelectedDevice()
    const devices = useStageSelector((state) =>
        state.devices.allIds
            .map((id) => state.devices.byId[id])
            .sort((a, b) => {
                if (a._id === localDeviceId) {
                    return -1
                }
                if (a.lastLoginAt.valueOf() > b.lastLoginAt.valueOf()) return -1
                return 1
            })
    )

    return (
        <table className={styles.table}>
            <tbody>
                {devices.map((device, index) => (
                    <tr
                        key={device._id}
                        className={`${styles.row} ${
                            selectedDeviceId === device._id ? styles.selected : ''
                        } ${!device.online ? styles.inactive : ''}`}
                        role="menuitem"
                        onClick={() => selectDeviceId(device._id)}
                        tabIndex={index}
                    >
                        <td className={styles.columnType}>
                            {TypeIcons[device.type]} {TypeNames[device.type]}
                        </td>
                        <td className={styles.columnName}>
                            {device.name ||
                                (device.type === 'mediasoup'
                                    ? `${device.os}: ${device.browser}`
                                    : device._id)}{' '}
                            {localDeviceId === device._id ? '(Dieser Webbrowser)' : ''}
                        </td>
                        <td className={styles.columnCreatedAt}>
                            {device.createdAt.toLocaleString()}
                        </td>
                        <td className={styles.columnLastLoginAt}>
                            {device.lastLoginAt.toLocaleString()}
                        </td>
                        <td className={styles.columnAction}>
                            {!device.online ? (
                                <Button
                                    size="small"
                                    onClick={() =>
                                        apiConnection.emit(
                                            ClientDeviceEvents.RemoveDevice,
                                            device._id as ClientDevicePayloads.RemoveDevice,
                                            (err) => {
                                                if (err) console.log(err)
                                            }
                                        )
                                    }
                                >
                                    <FaTrash />
                                </Button>
                            ) : undefined}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
export default DevicesList

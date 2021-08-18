import React from 'react'
import styles from './DeviceSelector.module.scss'
import Select from '../../ui/Select'
import { useConnection, useStageSelector, selectDevice } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { ImExit, MdMic, MdMicOff, MdVideocam, MdVideocamOff } from '../../ui/Icons'
import { useDispatch } from 'react-redux'
import Switch from '../../ui/Switch'

const DeviceSelector = ({
    className,
    ...props
}: Omit<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'children'
>) => {
    const { emit } = useConnection()
    const dispatch = useDispatch()
    const ready = useStageSelector((state) => state.globals.ready)
    const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)
    const insideStage = useStageSelector((state) => !!state.globals.stageId)
    const devices = useStageSelector((state) =>
        state.devices.allIds.map((id) => state.devices.byId[id])
    )
    const selectedDevice = useStageSelector((state) =>
        state.globals.selectedDeviceId
            ? state.devices.byId[state.globals.selectedDeviceId]
            : undefined
    )

    if (ready) {
        return (
            <div
                className={`${styles.deviceSelector} ${styles.large} ${className || ''}`}
                {...props}
            >
                {devices.length > 1 && (
                    <div className={styles.deviceSelectorItem}>
                        <Select
                            value={selectedDevice?._id}
                            onChange={(event) => {
                                dispatch(selectDevice(event.currentTarget.value))
                            }}
                        >
                            {devices.map((device) => {
                                const name =
                                    device.name || device.type === 'browser'
                                        ? `${device.os}: ${device.browser}`
                                        : device._id
                                return (
                                    <option key={device._id} value={device._id}>
                                        {name}
                                        {localDeviceId === device._id ? ' (lokal)' : ''}
                                    </option>
                                )
                            })}
                        </Select>
                    </div>
                )}
                {selectedDevice?.type === 'browser' ? (
                    <label className={styles.label}>
                        P2P
                        <Switch
                            round={true}
                            checked={selectedDevice.useP2P}
                            onChange={(e) =>
                                emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: selectedDevice._id,
                                    useP2P: e.currentTarget.checked,
                                } as ClientDevicePayloads.ChangeDevice)
                            }
                        />
                    </label>
                ) : null}
                {selectedDevice?.canVideo ? (
                    <>
                        <button
                            className="round secondary"
                            onClick={() =>
                                emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: selectedDevice._id,
                                    sendVideo: !selectedDevice.sendVideo,
                                })
                            }
                        >
                            {selectedDevice.sendVideo ? <MdVideocam /> : <MdVideocamOff />}
                        </button>
                    </>
                ) : null}
                {selectedDevice?.canAudio ? (
                    <button
                        onClick={() =>
                            emit(ClientDeviceEvents.ChangeDevice, {
                                _id: selectedDevice._id,
                                sendAudio: !selectedDevice.sendAudio,
                            } as ClientDevicePayloads.ChangeDevice)
                        }
                        className="round secondary"
                    >
                        {selectedDevice.sendAudio ? <MdMic /> : <MdMicOff />}
                    </button>
                ) : null}
                {insideStage ? (
                    <button
                        className="round danger"
                        onClick={() => emit(ClientDeviceEvents.LeaveStage)}
                    >
                        <ImExit />
                    </button>
                ) : null}
            </div>
        )
    }
    return null
}
export default DeviceSelector

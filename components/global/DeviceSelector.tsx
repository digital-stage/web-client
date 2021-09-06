import React from 'react'
import { Select } from 'ui/Select'
import { useEmit, useStageSelector, selectDevice } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useDispatch } from 'react-redux'
import { MdMic, MdMicOff, MdVideocam, MdVideocamOff } from 'react-icons/md'
import { ImExit } from 'react-icons/im'

const DeviceSelector = ({
    className,
    ...props
}: Omit<
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
    'children'
>) => {
    const emit = useEmit()
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
                className={`deviceSelector large ${className || ''}`}
                {...props}
            >
                {devices.length > 1 && (
                    <div className="deviceSelectorItem">
                        <Select
                            className="select"
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
export { DeviceSelector }

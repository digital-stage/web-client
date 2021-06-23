import { Device, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import useSelectedDevice from '../lib/useSelectedDevice'
import Select from '../ui/Select'

const DeviceSelector = () => {
    const availableDevices = useStageSelector<Device[]>((state) =>
        state.devices.allIds.map((id) => state.devices.byId[id])
    )
    const { selectedDeviceId, selectDeviceId } = useSelectedDevice()
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )

    if (availableDevices.length > 1) {
        return (
            <Select
                value={selectedDeviceId}
                onChange={(event) => {
                    selectDeviceId(event.currentTarget.value)
                }}
            >
                {availableDevices.map((d) => {
                    const name = d.name || d.type === 'mediasoup' ? `${d.os}: ${d.browser}` : d._id
                    return (
                        <option key={d._id} value={d._id}>
                            {name} {d._id === localDeviceId && '(Dieses Gerät)'}
                        </option>
                    )
                })}
            </Select>
        )
    }
    return null
}
export default DeviceSelector

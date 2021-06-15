import { Device, useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect } from 'react'
import useSelectedDevice from '../hooks/useSelectedDevice'
import Select from '../components/ui/Select'

const DeviceSelector = () => {
    const availableDevices = useStageSelector<Device[]>((state) =>
        state.devices.allIds.map((id) => state.devices.byId[id])
    )
    const { devices, selectDevices } = useSelectedDevice()

    useEffect(() => {
        if (availableDevices.length === 1) {
            selectDevices([availableDevices[0]._id])
        }
    }, [availableDevices.length])

    if (devices.length > 1) {
        return (
            <Select
                value={devices}
                multiple
                onChange={(event) => {
                    if (Array.isArray(event.currentTarget.value)) {
                        selectDevices(event.currentTarget.value)
                    } else {
                        selectDevices([event.currentTarget.value])
                    }
                }}
            >
                {availableDevices.map((d) => (
                    <option key={d._id} value={d._id}>
                        {d.name || d._id}
                    </option>
                ))}
            </Select>
        )
    }
    return null
}
export default DeviceSelector

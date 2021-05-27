import { Device, useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect } from 'react'
import useSelectedDevice from '../hooks/useSelectedDevice'
import Select from './ui/Select'

const DeviceSelector = () => {
    const devices = useStageSelector<Device[]>((state) =>
        state.devices.allIds.map((id) => state.devices.byId[id])
    )
    const { device, setDevice } = useSelectedDevice()

    useEffect(() => {
        if (devices.length === 1) {
            setDevice(devices[0]._id)
        }
    }, [devices.length])

    if (devices.length > 1) {
        return (
            <Select
                value={device}
                onChange={(event) => {
                    setDevice(event.currentTarget.value)
                }}
            >
                {devices.map((d) => (
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

import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import useSelectedDevice from '../lib/useSelectedDevice'
import Select from '../fastui/components/interaction/Select'

const DeviceSelector = () => {
    const { selectedDeviceId, selectDeviceId, devices } = useSelectedDevice()
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )

    if (devices.length > 1) {
        return (
            <Select
                value={selectedDeviceId}
                onChange={(event) => {
                    selectDeviceId(event.currentTarget.value)
                }}
            >
                {devices.map((d) => {
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

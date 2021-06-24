import React, { createContext, useEffect, useState } from 'react'
import { Device, useStageSelector } from '@digitalstage/api-client-react'

interface ISelectedDeviceContext {
    selectedDeviceId?: string
    selectedDevice?: Device
    selectDeviceId: (deviceId: string) => any
    devices: Device[]
}

const SelectedDeviceContext = createContext<ISelectedDeviceContext>({
    selectDeviceId: () => {
        throw new Error('Missing provider')
    },
    devices: [],
})

export const SelectedDeviceProvider = (props: { children: React.ReactNode }) => {
    const { children } = props
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )
    const [selectedDeviceId, selectDeviceId] = useState<string>()
    const devices = useStageSelector((state) =>
        state.devices.allIds.map((id) => state.devices.byId[id])
    )
    const selectedDevice = useStageSelector<Device | undefined>(
        (state) => state.devices.byId[selectedDeviceId]
    )

    useEffect(() => {
        if (!selectedDevice && devices.length > 0) {
            selectDeviceId(localDeviceId)
        }
    }, [selectedDevice, devices, localDeviceId])

    return (
        <SelectedDeviceContext.Provider
            value={{
                selectedDeviceId,
                selectedDevice,
                selectDeviceId,
                devices,
            }}
        >
            {children}
        </SelectedDeviceContext.Provider>
    )
}

const useSelectedDevice = (): ISelectedDeviceContext =>
    React.useContext<ISelectedDeviceContext>(SelectedDeviceContext)

export default useSelectedDevice

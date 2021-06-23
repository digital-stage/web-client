import React, { createContext, useEffect, useState } from 'react'
import { Device, useStageSelector } from '@digitalstage/api-client-react'

interface ISelectedDeviceContext {
    selectedDeviceId?: string
    selectedDevice?: Device
    selectDeviceId: (deviceId: string) => any
}

const SelectedDeviceContext = createContext<ISelectedDeviceContext>({
    selectDeviceId: () => {
        throw new Error('Missing provider')
    },
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
    /*
    useEffect(() => {
        if (localDeviceId) {
            selectDeviceId((prev) => {
                if (!prev) return localDeviceId
                return prev
            })
        }
    }, [localDeviceId]) */

    useEffect(() => {
        if (!selectedDevice && devices.length > 0) {
            console.log('SELECTING LOCAL DEVICE')
            selectDeviceId(localDeviceId)
        }
    }, [selectedDevice, devices, localDeviceId])

    return (
        <SelectedDeviceContext.Provider
            value={{
                selectedDeviceId,
                selectedDevice,
                selectDeviceId,
            }}
        >
            {children}
        </SelectedDeviceContext.Provider>
    )
}

const useSelectedDevice = (): ISelectedDeviceContext =>
    React.useContext<ISelectedDeviceContext>(SelectedDeviceContext)

export default useSelectedDevice

import React, { createContext, useEffect, useState } from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'
import isEqual from 'lodash/isEqual'

interface MODE {
    all: 'all'
    local: 'local'
    custom: 'custom'
}

interface ISelectedDeviceContext {
    mode: MODE[keyof MODE]
    devices: string[]
    selectDevices: (devices: string[]) => any
    selectAll: () => any
}

const SelectedDeviceContext = createContext<ISelectedDeviceContext>({
    mode: 'local',
    devices: [],
    selectDevices: () => {
        throw new Error('Missing provider')
    },
    selectAll: () => {
        throw new Error('Missing provider')
    },
})

export const SelectedDeviceProvider = (props: { children: React.ReactNode }) => {
    const { children } = props
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )
    const allDeviceIds = useStageSelector((state) => state.devices.allIds)
    const [mode, setMode] = useState<MODE[keyof MODE]>('local')
    const [devices, selectDevices] = useState<string[]>([])

    useEffect(() => {
        if (localDeviceId) {
            selectDevices((prev) => {
                if (prev.length === 0) return [localDeviceId]
                return prev
            })
        }
    }, [localDeviceId])

    useEffect(() => {
        if (
            devices.length === allDeviceIds.length &&
            isEqual(devices.sort(), allDeviceIds.sort())
        ) {
            setMode('all')
        } else if (devices.length === 1 && devices[0] === localDeviceId) {
            setMode('local')
        } else {
            setMode('custom')
        }
    }, [localDeviceId, allDeviceIds, devices])

    return (
        <SelectedDeviceContext.Provider
            value={{
                mode,
                devices,
                selectDevices,
                selectAll: () => setMode('all'),
            }}
        >
            {children}
        </SelectedDeviceContext.Provider>
    )
}

const useSelectedDevice = (): ISelectedDeviceContext =>
    React.useContext<ISelectedDeviceContext>(SelectedDeviceContext)

export default useSelectedDevice

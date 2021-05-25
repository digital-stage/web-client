import React, { createContext, useEffect, useState } from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'

interface ISelectedDeviceContext {
    device?: string
    setDevice: (device: string) => any
}

const SelectedDeviceContext = createContext<ISelectedDeviceContext>({
    setDevice: () => {
        throw new Error('Missing provider')
    },
})

export const SelectedDeviceProvider = (props: { children: React.ReactNode }) => {
    const { children } = props
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )
    const [device, setDevice] = useState<string>()

    useEffect(() => {
        if (localDeviceId) {
            setDevice((prev) => {
                if (!prev) return localDeviceId
                return prev
            })
        }
    }, [localDeviceId])

    return (
        <SelectedDeviceContext.Provider
            value={{
                device,
                setDevice,
            }}
        >
            {children}
        </SelectedDeviceContext.Provider>
    )
}

const useSelectedDevice = (): ISelectedDeviceContext =>
    React.useContext<ISelectedDeviceContext>(SelectedDeviceContext)

export default useSelectedDevice

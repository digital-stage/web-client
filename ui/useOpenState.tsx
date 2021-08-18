import { useEffect, useState } from 'react'

export interface OpenState {
    open: 'open'
    opening: 'opening'
    closing: 'closing'
    closed: 'closed'
}

const useOpenState = (open: boolean): OpenState[keyof OpenState] => {
    const [openState, setOpenState] = useState<OpenState[keyof OpenState]>(open ? 'open' : 'closed')

    useEffect(() => {
        setOpenState((prev) => {
            if (open && prev !== 'open') {
                return 'opening'
            }
            if (!open && prev !== 'closed') {
                return 'closing'
            }
            return prev
        })
    }, [open])

    useEffect(() => {
        if (openState === 'opening') {
            const timeout = setTimeout(() => {
                setOpenState('open')
            }, 10)
            return () => {
                if (timeout) clearTimeout(timeout)
            }
        }
        if (openState === 'closing') {
            const timeout = setTimeout(() => {
                setOpenState('closed')
            }, 200)
            return () => {
                if (timeout) clearTimeout(timeout)
            }
        }
        return undefined
    }, [openState])

    return openState
}
export default useOpenState

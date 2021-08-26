import React from 'react'
import { SocketEvent } from 'teckos-client/dist/types'
import { EmitContext } from '../provider/ConnectionProvider'

const useEmit = (): ((event: SocketEvent, ...args: any[]) => boolean) => {
    const state = React.useContext(EmitContext)
    if (state === undefined) {
        throw new Error('useEmit must be used within a ConnectionProvider')
    }
    return React.useMemo(() => {
        return state.emit
    }, [state])
}
export { useEmit }

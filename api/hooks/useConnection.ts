import React from 'react'
import { ConnectionContext } from '../provider/ConnectionProvider'
import { ITeckosClient } from 'teckos-client'

const useConnection = (): ITeckosClient => {
    const state = React.useContext(ConnectionContext)
    if (state === undefined) {
        throw new Error('useConnection must be used within a ConnectionProvider')
    }
    return React.useMemo(() => {
        return state.connection
    }, [state])
}
export { useConnection }

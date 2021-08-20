import React from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'
import { ITeckosClient } from 'teckos-client'

const useConnection = () => {
    const connection = useStageSelector<ITeckosClient>((state) => state.globals.connection)
    return {
        connection,
        emit: connection?.emit,
    }
}
export default useConnection

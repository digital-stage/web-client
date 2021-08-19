import React, { useContext } from 'react'
import { ConnectionContext, ConnectionContextT } from '../provider/ConnectionProvider'

const useConnection = () => useContext<ConnectionContextT>(ConnectionContext)
export default useConnection

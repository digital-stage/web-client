import { SocketEvent } from 'teckos-client/dist/types'
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react'
import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import { reset, useStageSelector } from '@digitalstage/api-client-react'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from '../redux/registerSocketHandler'
import { useDispatch } from 'react-redux'
import debug from 'debug'

const report = debug('useConnection')
const warn = report.extend('warn')

interface IConnectionContext {
    connection?: ITeckosClient
    emit: (event: SocketEvent, ...args: any[]) => boolean | undefined
}

const ConnectionContext = createContext<IConnectionContext>({
    emit: () => {
        throw new Error('Please wrap your inner DOM with ConnectionProvider')
    },
})

const ConnectionProvider = ({ children }: { children: ReactNode }): JSX.Element => {
    console.log('RERENDER ConnectionProvider')
    const [connection, setConnection] = useState<ITeckosClient | undefined>()
    const userId = useStageSelector<string | undefined>((state) => state.auth.user?._id)
    const token = useStageSelector<string | undefined>((state) => state.auth.token)
    const dispatch = useDispatch()

    useEffect(() => {
        if (token && userId) {
            let isActive = true
            let conn: ITeckosClient

            getInitialDevice(userId, true)
                .then((initialDevice) => {
                    if (isActive) {
                        report('Creating new connection to API server')
                        return new TeckosClientWithJWT(
                            process.env.NEXT_PUBLIC_API_URL,
                            {
                                reconnection: true,
                                debug: true,
                            },
                            token,
                            {
                                device: initialDevice,
                            }
                        )
                    }
                    return undefined
                })
                .then((conn) => {
                    if (conn && isActive) {
                        registerSocketHandler(dispatch, conn)
                        return conn
                    }
                    return undefined
                })
                .then((conn) => {
                    if (isActive) {
                        setConnection(conn)
                        conn.connect()
                    }
                })
            return () => {
                isActive = false
                if (conn) {
                    report('Closing connection to API server')
                    conn.disconnect()
                }
                dispatch(reset())
                setConnection(undefined)
            }
        }
    }, [dispatch, token, userId])

    const emit = useCallback(
        (event: SocketEvent, ...args: any[]) => {
            if (connection) {
                return connection.emit(event, ...args)
            }
            warn('Not connected')
            return undefined
        },
        [connection]
    )

    const value = React.useMemo<IConnectionContext>(
        () => ({
            connection,
            emit,
        }),
        [connection, emit]
    )

    return <ConnectionContext.Provider value={value}>{children}</ConnectionContext.Provider>
}

const MemorizedConnectionProvider = ConnectionProvider

const useConnection = () => useContext<IConnectionContext>(ConnectionContext)
export { MemorizedConnectionProvider as ConnectionProvider, ConnectionContext }
export default useConnection

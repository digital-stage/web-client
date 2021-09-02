import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import React from 'react'
import { useDispatch } from 'react-redux'
import { getInitialDevice } from '../utils/getInitialDevice'
import { registerSocketHandler } from '../redux/registerSocketHandler'
import Cookie from 'js-cookie'
import { SocketEvent } from 'teckos-client/dist/types'
import { logger } from '../logger'
import { useStageSelector } from '../redux/selectors/useStageSelector'
import { useNotification } from '../hooks/useNotification'

const { trace } = logger('ConnectionService')

type ConnectionState = ITeckosClient
type ConnectionDispatch = React.Dispatch<React.SetStateAction<ConnectionState>>

const ConnectionDispatchContext = React.createContext<ConnectionDispatch>(undefined)
const ConnectionStateContext = React.createContext<ConnectionState>(undefined)

const ConnectionProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [connection, setConnection] = React.useState<ConnectionState>(null)
    return (
        <ConnectionDispatchContext.Provider value={setConnection}>
            <ConnectionStateContext.Provider value={connection}>
                {children}
            </ConnectionStateContext.Provider>
        </ConnectionDispatchContext.Provider>
    )
}
const useConnection = (): ITeckosClient => {
    const state = React.useContext(ConnectionStateContext)
    if (state === undefined) {
        throw new Error('useConnection must be used within a ConnectionProvider')
    }
    return React.useMemo(() => state, [state])
}
const useEmit = (): ((event: SocketEvent, ...args: any[]) => boolean) => {
    const connection = useConnection()
    return connection?.emit
}

const ConnectionService = (): JSX.Element => {
    trace('RENDER')
    const userId = useStageSelector<string | undefined>((state) => state.auth.user?._id)
    const token = useStageSelector<string | undefined>((state) => state.auth.token)
    const dispatch = useDispatch()
    const setConnection = React.useContext(ConnectionDispatchContext)
    const notify = useNotification()

    React.useEffect(() => {
        if (setConnection && token && userId && notify) {
            let isActive = true
            let conn: ITeckosClient

            const uuid = Cookie.get(userId)
            getInitialDevice(true, uuid)
                .then((initialDevice) => {
                    if (isActive) {
                        trace('Creating new connection to API server')
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
                        conn.on('reconnect', () => {
                            trace('RECONNECT')
                            //setConnection(conn)
                        })
                        conn.on('connect', () => {
                            trace('CONNECTED?')
                        })
                        conn.on('disconnect', () => {
                            //setConnection(undefined)
                        })
                        setConnection(conn)
                        conn.connect()
                    }
                })
                .catch((err) => {
                    notify({
                        kind: 'error',
                        message: err,
                    })
                    console.error(err)
                })
            return () => {
                isActive = false
                if (conn) {
                    trace('Closing connection to API server')
                    conn.disconnect()
                }
                setConnection(undefined)
            }
        }
    }, [dispatch, notify, setConnection, token, userId])

    return null
}
export { ConnectionProvider, ConnectionService, useConnection, useEmit, ConnectionStateContext }

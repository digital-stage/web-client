import debug from 'debug'
import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import React from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'
import { useDispatch } from 'react-redux'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from '../redux/registerSocketHandler'
import Cookie from 'js-cookie'
import { SocketEvent } from 'teckos-client/dist/types'

const report = debug('ConnectionProvider')
const reportError = report.extend('error')

export const EmitContext =
    React.createContext<{ emit: (event: SocketEvent, ...args: any[]) => boolean }>(undefined)
export const ConnectionContext = React.createContext<{
    connection?: ITeckosClient
}>(undefined)

const ConnectionProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    report('RENDER')

    const userId = useStageSelector<string | undefined>((state) => state.auth.user?._id)
    const token = useStageSelector<string | undefined>((state) => state.auth.token)
    const [connection, setConnection] = React.useState<ITeckosClient>()
    const dispatch = useDispatch()

    React.useEffect(() => {
        if (token && userId) {
            let isActive = true
            let conn: ITeckosClient

            const uuid = Cookie.get(userId)
            getInitialDevice(true, uuid)
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
                        conn.on('connected', () => {
                            console.log('CONNECTED?')
                        })
                        conn.on('disconnect', () => {
                            setConnection(undefined)
                        })
                        setConnection(conn)
                        conn.connect()
                    }
                })
                .catch((err) => {
                    reportError(err)
                })
            return () => {
                isActive = false
                if (conn) {
                    report('Closing connection to API server')
                    conn.disconnect()
                }
                setConnection(undefined)
            }
        }
    }, [dispatch, token, userId])

    const connectionValue = React.useMemo(() => {
        return { connection }
    }, [connection])

    const emitValue = React.useMemo(() => {
        return {
            emit: connection ? connection.emit : undefined,
        }
    }, [connection])

    return (
        <ConnectionContext.Provider value={connectionValue}>
            <EmitContext.Provider value={emitValue}>{children}</EmitContext.Provider>
        </ConnectionContext.Provider>
    )
}

export { ConnectionProvider }

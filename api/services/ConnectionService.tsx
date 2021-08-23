import debug from 'debug'
import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import React, { useEffect } from 'react'
import { setConnection, useStageSelector } from '@digitalstage/api-client-react'
import { useDispatch } from 'react-redux'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from '../redux/registerSocketHandler'

const log = debug('ConnectionProvider')

const ConnectionService = (): JSX.Element => {
    console.log('RERENDER ConnectionService')
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
                        log('Creating new connection to API server')
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
                        dispatch(setConnection(conn))
                        conn.connect()
                    }
                })
            return () => {
                isActive = false
                if (conn) {
                    log('Closing connection to API server')
                    conn.disconnect()
                }
                dispatch(setConnection(undefined))
            }
        }
    }, [dispatch, token, userId])

    return null
}

export default ConnectionService

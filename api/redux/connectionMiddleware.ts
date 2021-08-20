import { Middleware } from 'redux'
import Cookie from 'js-cookie'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import { connect, disconnect } from './actions/clientActions'
import InternalActionTypes from './actions/InternalActionTypes'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from './registerSocketHandler'

let connection: ITeckosClient

const connectionMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    any
> = (storeApi) => (next) => (action) => {
    const state = storeApi.getState() // correctly typed as RootState
    switch (action.type) {
        case InternalActionTypes.SET_TOKEN: {
            const token = action.payload as string
            if (token) {
                storeApi.dispatch(connect())
            } else {
                storeApi.dispatch(disconnect())
            }
            break
        }
        case InternalActionTypes.CONNECT: {
            const token = storeApi.getState().auth.token
            const userId = storeApi.getState().auth.user?._id
            getInitialDevice(userId, true)
                .then((initialDevice) => {
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
                })
                .then((conn) => {
                    if (conn) {
                        registerSocketHandler(storeApi.dispatch, conn)
                        return conn
                    }
                    return undefined
                })
                .then((conn) => {
                    conn.connect()
                })
            break
        }
        case InternalActionTypes.DISCONNECT: {
            if (connection) connection.disconnect()
            break
        }
        case ServerDeviceEvents.LocalDeviceReady: {
            const payload = action.payload as ServerDevicePayloads.LocalDeviceReady
            if (state.auth.user) {
                // Will be read by getInitialDevice() in next session
                Cookie.set(state.auth.user._id, payload.uuid, { expires: 365 })
            }
            break
        }
    }
    return next(action)
}
export default connectionMiddleware

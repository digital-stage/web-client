import { Middleware } from 'redux'
import { ServerDeviceEvents, ServerDevicePayloads, User } from '@digitalstage/api-types'
import { ITeckosClient, TeckosClientWithJWT } from 'teckos-client'
import { disconnect, setConnection, setToken, setUser } from './actions/clientActions'
import InternalActionTypes from './actions/InternalActionTypes'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from './registerSocketHandler'
import Cookie from 'js-cookie'
import { getUserByToken } from './actions'
import logger from './../utils/logger'

let connection: ITeckosClient

const connectAction: any = (token: string, userId: string) => (dispatch) =>
    getInitialDevice(userId, true).then((initialDevice) => {
        connection = new TeckosClientWithJWT(
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
        registerSocketHandler(dispatch, connection)
        logger.info('Connecting to API server...')
        connection.connect()
        return dispatch(setConnection(connection))
    })

const signInWithTokenAction: any = (token: string) => (dispatch) =>
    getUserByToken(token).then((user) => dispatch(setUser(user)))

const connectionMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    any
> = (storeApi) => (next) => (action) => {
    const { dispatch } = storeApi
    const state = storeApi.getState()
    switch (action.type) {
        case InternalActionTypes.INIT: {
            const token = Cookie.get('token')
            if (token) {
                dispatch(setToken(token))
            }
            break
        }
        case InternalActionTypes.SET_TOKEN: {
            const token = action.payload as string
            if (token) {
                dispatch(signInWithTokenAction(token))
            } else {
                dispatch(setUser(undefined))
            }
            break
        }
        case InternalActionTypes.SET_USER: {
            const user = action.payload as User
            if (user) {
                const token = state.auth.token
                if (token) {
                    dispatch(connectAction(token, user._id))
                }
            } else {
                dispatch(disconnect())
            }
            break
        }
        case InternalActionTypes.DISCONNECT: {
            if (connection) connection.disconnect()
            dispatch(setConnection(undefined))
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

import {Middleware} from 'redux'
import {ServerDeviceEvents, ServerDevicePayloads, User} from '@digitalstage/api-types'
import {ITeckosClient, TeckosClientWithJWT} from 'teckos-client'
import {disconnect, setEmit, setInitialized, setToken, setUser} from './actions/clientActions'
import InternalActionTypes from './actions/InternalActionTypes'
import getInitialDevice from '../utils/getInitialDevice'
import registerSocketHandler from './registerSocketHandler'
import Cookie from 'js-cookie'
import {getUserByToken} from './actions'
import debug from "debug";
import {batch} from "react-redux";
import {RootState} from "@digitalstage/api-client-react";

const report = debug("ConnectionMiddleware")
const reportError = report.extend("error")

let connection: ITeckosClient

const connectAction: any = (token: string, userId: string) => (dispatch) => {
  const uuid = Cookie.get(userId)
  return getInitialDevice(true, uuid)
    .then((initialDevice) => {
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
      report('Connecting to API server...')
      connection.connect()
      return dispatch(setEmit(connection.emit))
    })
}

const initializeApplication: any = (token?: string) => async (dispatch) => {
  if (token) {
    try {
      const user = await getUserByToken(token)
      if (user) {
        batch(() => {
            dispatch(setToken(token))
            dispatch(setUser(user))
          }
        )
      }
    } catch (e) {
      reportError(e)
    }
  }
  dispatch(setInitialized(true))
}

const connectionMiddleware: Middleware<{}, // Most middleware do not modify the dispatch return value
  RootState> = (storeApi) => (next) => (action) => {
  const {dispatch} = storeApi
  const prevState = storeApi.getState()
  switch (action.type) {
    case InternalActionTypes.INIT: {
      const token = Cookie.get('token')
      dispatch(initializeApplication(token))
      break
    }
    case InternalActionTypes.SET_TOKEN: {
      const {token, staySignedIn} = action.payload as { token?: string, staySignedIn?: boolean }
      if (!token) {
        dispatch(disconnect())
        Cookie.remove('token')
      } else {
        Cookie.set('token', token, {expires: staySignedIn ? 7 : undefined})
      }
      break;
    }
    case InternalActionTypes.SET_USER: {
      const user = action.payload as User
      if (user) {
        const token = prevState.auth.token
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
      dispatch(setEmit(undefined))
      break
    }
    case ServerDeviceEvents.LocalDeviceReady: {
      const payload = action.payload as ServerDevicePayloads.LocalDeviceReady
      if (prevState.auth.user) {
        // Will be read by getInitialDevice() in next session
        Cookie.set(prevState.auth.user._id, payload.uuid, {expires: 365})
      }
      break
    }
  }
  return next(action)
}
export {
  connection
}
export default connectionMiddleware

import { Middleware } from 'redux'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { setInitialized, setToken, setUser } from './actions/clientActions'
import { InternalActionTypes } from './actions/InternalActionTypes'
import Cookie from 'js-cookie'
import { getUserByToken } from './actions'

import { batch } from 'react-redux'
import { RootState } from '@digitalstage/api-client-react'
import { logger } from '../logger'

const { trace } = logger('authMiddleware')

const initializeApplication: any = (token?: string) => async (dispatch) => {
    if (token) {
        try {
            trace('Verifying token from cookie')
            const user = await getUserByToken(token)
            if (user) {
                trace('Auto logged in')
                batch(() => {
                    dispatch(setToken(token))
                    dispatch(setUser(user))
                })
            }
        } catch (e) {
            console.error(e)
        }
    }
    dispatch(setInitialized(true))
}

const authMiddleware: Middleware<
    {}, // Most middleware do not modify the dispatch return value
    RootState
> = (storeApi) => (next) => (action) => {
    const { dispatch } = storeApi
    const prevState = storeApi.getState()
    switch (action.type) {
        case InternalActionTypes.INIT: {
            const token = Cookie.get('token')
            dispatch(initializeApplication(token))
            break
        }
        case InternalActionTypes.SET_TOKEN: {
            const { token, staySignedIn } = action.payload as {
                token?: string
                staySignedIn?: boolean
            }
            if (!token) {
                Cookie.remove('token')
            } else {
                Cookie.set('token', token, { expires: staySignedIn ? 7 : undefined })
            }
            break
        }
        case ServerDeviceEvents.LocalDeviceReady: {
            const payload = action.payload as ServerDevicePayloads.LocalDeviceReady
            if (prevState.auth.user) {
                // Will be read by getInitialDevice() in next session
                Cookie.set(prevState.auth.user._id, payload.uuid, { expires: 365 })
            }
            break
        }
    }
    return next(action)
}
export { authMiddleware }

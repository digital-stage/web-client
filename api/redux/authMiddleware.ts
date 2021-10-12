/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {Dispatch, Middleware } from 'redux'
import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import Cookie from 'js-cookie'
import { batch } from 'react-redux'
import { setInitialized, setToken, setUser } from './actions/clientActions'
import { InternalActionTypes } from './actions/InternalActionTypes'
import { getUserByToken } from './actions'

import { logger } from '../logger'
import { RootState } from './RootState'

const { trace } = logger('authMiddleware')

const initializeApplication: any = (token?: string) => async (dispatch: Dispatch) => {
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
                Cookie.set('token', token, { expires: staySignedIn ? 7 : undefined, sameSite: 'strict' })
            }
            break
        }
        case ServerDeviceEvents.LocalDeviceReady: {
            const payload = action.payload as ServerDevicePayloads.LocalDeviceReady
            if (prevState.auth.user && payload.uuid) {
                // Will be read by getInitialDevice() in next session
                Cookie.set(prevState.auth.user._id, payload.uuid, { expires: 365, sameSite: 'strict' })
            }
            break
        }
    }
    return next(action)
}
export { authMiddleware }

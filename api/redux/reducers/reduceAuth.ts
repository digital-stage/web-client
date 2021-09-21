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

import { Auth } from '../state/Auth'
import { AnyAction, CombinedState } from 'redux'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const reduceAuth = (
    state: CombinedState<Auth> = {
        initialized: false,
    },
    action: AnyAction
): CombinedState<Auth> => {
    switch (action.type) {
        case InternalActionTypes.SET_INITIALIZED: {
            return {
                ...state,
                initialized: action.payload,
            }
        }
        case InternalActionTypes.SET_TOKEN:
            const { token } = action.payload as { token?: string; staySignedIn?: boolean }
            return {
                ...state,
                token: token,
            }
        case InternalActionTypes.SET_USER:
            return {
                ...state,
                user: action.payload,
            }
        case InternalActionTypes.LOGOUT:
            return {
                ...state,
                user: undefined,
                token: undefined,
            }
        default:
            return state
    }
}
export { reduceAuth }

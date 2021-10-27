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

import * as React from 'react'
import {logout, InternalActionTypes, useTrackedSelector} from '@digitalstage/api-client-react'
import {batch, useDispatch} from 'react-redux'
import {Loading} from 'components/global/Loading';
import {useRouter} from "next/router";

const Logout = (): JSX.Element => {
  const dispatch = useDispatch()
  const state = useTrackedSelector()
  const {initialized} = state.auth
  const {token} = state.auth
  const {isReady, replace} = useRouter()
  const signedOut = state.auth.initialized && !state.auth.user
  React.useEffect(() => {
    if (isReady && signedOut) {
      replace('/account/login')
    }
  }, [isReady, replace, signedOut])

  React.useEffect(() => {
    if (initialized && token && state.globals.authUrl) {
      logout(state.globals.authUrl, token)
        .then(() =>
          batch(() => {
            dispatch({
              type: InternalActionTypes.LOGOUT,
            })
            dispatch({
              type: InternalActionTypes.RESET,
            })
          })
        )
    }
  }, [dispatch, initialized, token])

  return (
    <Loading message="Melde Dich ab..."/>
  )
}

export default Logout

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
import {useEffect} from 'react'
import {logout, useStageSelector, InternalActionTypes} from '@digitalstage/api-client-react'
import {batch, useDispatch} from 'react-redux'
import {useForwardToLoginWhenSignedOut} from "../../lib/useForwardToLoginWhenSignedOut";
import {Loading} from 'components/global/Loading';

const Logout = (): JSX.Element => {
  useForwardToLoginWhenSignedOut()
  const dispatch = useDispatch()
  const initialized = useStageSelector((state) => state.auth.initialized)
  const token = useStageSelector((state) => state.auth.token)

  useEffect(() => {
    if (initialized && token) {
      logout(token)
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

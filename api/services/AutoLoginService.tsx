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

import { batch, useDispatch } from 'react-redux'
import React from 'react'
import cookie from 'js-cookie'
import {setInitialized, setToken, setUser, signInWithToken } from '../redux/actions'


const AutoLoginService = () => {
    const dispatch = useDispatch()

    React.useEffect(() => {
        const token = cookie.get('token')
        if (token) {
            signInWithToken(token)
                .then((user) => {
                    batch(() => {
                        dispatch(setUser(user))
                        dispatch(setToken(token))
                    })
                })
                .catch((err) => {
                    console.error(err)
                })
                .finally(() => dispatch(setInitialized(true)))
        } else {
            dispatch(setInitialized(true))
        }
    }, [dispatch])
    return null
}
export { AutoLoginService }

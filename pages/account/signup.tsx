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

import React from 'react'
import {selectSignedIn, useTrackedSelector} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import {SignUpForm} from 'components/account/SignUpForm'
import {AuthLayout} from 'components/account/AuthLayout'

const SignUp = (): JSX.Element => {
  const {isReady, push, replace} = useRouter()
  const state = useTrackedSelector()
  const signedIn = selectSignedIn(state)

  const onSignedIn = React.useCallback(() => {
    push("/account/activate")
  }, [push])


  React.useEffect(() => {
    if (isReady && signedIn) {
      replace('/')
    }
  }, [isReady, replace, signedIn])

  return (
    <AuthLayout showMenu>
      <SignUpForm onSignedUp={onSignedIn}/>
    </AuthLayout>
  )
}
export default SignUp

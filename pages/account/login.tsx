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

import {LoginForm} from 'components/account/LoginForm'
import Link from 'next/link'
import React from 'react'
import {AuthLayout} from 'components/account/AuthLayout'
import {useForwardToStagesWhenSignedIn} from "../../lib/useForwardToStagesWhenSignedIn";

const Login = (): JSX.Element => {
  useForwardToStagesWhenSignedIn()

  return (
    <AuthLayout showMenu>
      <LoginForm/>
      <Link href="/account/forgot" passHref>
        <a className="text">Passwort vergessen?</a>
      </Link>
      <Link href="/account/activate" passHref>
        <a className="text">Konto aktivieren</a>
      </Link>
      <Link href="/account/reactivate" passHref>
        <a className="text">Kein Aktivierungscode erhalten?</a>
      </Link>
    </AuthLayout>
  )
}
export default Login

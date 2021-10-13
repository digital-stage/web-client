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
import {useRouter} from 'next/router'
import {ResetPasswordForm} from 'components/account/ResetPasswordForm'
import {AuthLayout} from 'components/account/AuthLayout'
import Link from 'next/link'
import {Paragraph} from '../../ui/Paragraph'
import {Loading} from "../../components/global/Loading";
import {Heading3} from "../../ui/Heading";

const Reset = () => {
  const {query, push, isReady} = useRouter()
  const [resetToken, setResetToken] = React.useState<string>()

  React.useEffect(() => {
    if(isReady) {
      const token = Array.isArray(query.token) ? query.token[0] : query.token
      if(token) {
        setResetToken(token)
      } else {
        push("/account/login")
      }
    }
  }, [isReady, query, push])

  const onReset = React.useCallback(() => {
    push("/account/login")
  }, [push])

  if (resetToken) {
    return (
      <AuthLayout>
        <Heading3>Passwort zurücksetzen</Heading3>
        <Paragraph kind="micro">
          Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein kleiner und ein
          großer Buchstabe sowie insgesamt eine Mindestlänge von 8 Zeichen haben.
        </Paragraph>
        <ResetPasswordForm resetToken={resetToken} onReset={onReset}/>
        <Link href="/account/login" passHref>
          <a className="text">Zurück</a>
        </Link>
      </AuthLayout>
    )
  }
  return <Loading/>
}
export default Reset

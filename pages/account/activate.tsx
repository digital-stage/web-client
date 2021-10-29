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
import Link from 'next/link'
import {ActivationForm} from 'components/account/ActivationForm'
import {AuthLayout} from 'components/account/AuthLayout'
import {Paragraph} from '../../ui/Paragraph'
import {useForwardToStagesWhenSignedIn} from "../../lib/useForwardToStagesWhenSignedIn";
import {Loading} from "../../components/global/Loading";
import {Heading3} from "../../ui/Heading";

const Activate = (): JSX.Element => {
  useForwardToStagesWhenSignedIn()
  const {isReady, query, push, prefetch} = useRouter()

  React.useEffect(() => {
    prefetch('/account/login')
  }, [prefetch])

  const onActivated = React.useCallback(() => push("/account/login"), [push])

  const initialCode = React.useMemo(() => {
    if (isReady) {
      return Array.isArray(query.code) ? query.code[0] : query.code
    }
  }, [isReady, query])

  if(isReady) {
    return (
      <AuthLayout>
        <Heading3>Konto aktivieren</Heading3>
        <Paragraph kind="micro">
          Bitte gebe den Aktivierungscode ein, welchen Du per E-Mail von uns erhalten hast:
        </Paragraph>
        <ActivationForm onActivated={onActivated} initialCode={initialCode}/>
        <Link href="/account/login" passHref>
          <a className="text">Zurück</a>
        </Link>
      </AuthLayout>
    )
  }
  return <Loading/>
}
export default Activate

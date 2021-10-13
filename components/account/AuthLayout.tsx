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

import Image from 'next/image'
import React from 'react'
import {SecondaryHeadlineLink} from 'ui/HeadlineLink'
import {Container} from 'ui/Container'
import {Panel} from 'ui/Panel'
import {Heading4} from "../../ui/Heading";

const AuthLogo = () => (
  <div className="authLogo">
    <Image alt="Digital Stage" src="/logo-full.svg" width={180} height={93}/>
  </div>
)

const AuthNav = () => (
  <nav className="authNav">
    <SecondaryHeadlineLink className="authNavItem" href="/account/login">
      <Heading4>Login</Heading4>
    </SecondaryHeadlineLink>
    <SecondaryHeadlineLink className="authNavItem" href="/account/signup">
      <Heading4>Registrieren</Heading4>
    </SecondaryHeadlineLink>
  </nav>
)

const AuthLayout = ({children, showMenu}: { children: React.ReactNode; showMenu?: boolean }) => (
    <Container className="authLayout" size="tiny">
      <AuthLogo/>
      <Panel kind="black">
        {showMenu && <AuthNav/>}
        {children}
      </Panel>
    </Container>
  )
AuthLayout.defaultProps = {
  showMenu: undefined,
}
export {AuthLayout}

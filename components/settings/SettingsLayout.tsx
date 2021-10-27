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

import { SecondaryHeadlineLink  } from 'ui/HeadlineLink'
import React from 'react'
import {Container} from 'ui/Container'
import { Panel } from 'ui/Panel'
import {Heading4} from "../../ui/Heading";

const SettingsNav = (): JSX.Element => (
    <nav className="settingsNav">
        <SecondaryHeadlineLink className="settingsNavItem" href="/settings/device">
            <Heading4 className="settingHeading">Gerät</Heading4>
        </SecondaryHeadlineLink>
        <SecondaryHeadlineLink className="settingsNavItem" href="/settings/profile">
            <Heading4 className="settingHeading">Profil</Heading4>
        </SecondaryHeadlineLink>
    </nav>
)
const SettingsLayout = ({ children }: { children: React.ReactNode }): JSX.Element => (
        <Container size="small">
            <Panel className="settingsPanel">
                <SettingsNav />
                {children}
            </Panel>
        </Container>
    )
export { SettingsLayout }

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

import '../scripts/wdyr'
import React from 'react'
import "../styles/root.css"
import "../styles/index.scss"
import Head from 'next/head'
import {AppProps, NextWebVitalsMetric} from 'next/app'
import {DigitalStageProvider, useTrackedSelector} from '@digitalstage/api-client-react'
import {Background} from 'components/global/Background'
import {Sidebar} from 'components/global/Sidebar'
import {DeviceSelector} from '../components/global/DeviceSelector'
import {ConnectionOverlay} from '../components/global/ConnectionOverlay'
import {ProfileMenu} from '../components/global/ProfileMenu'
import {PlaybackOverlay} from '../components/global/PlaybackOverlay'
import {StageJoiner} from '../components/global/StageJoiner'
import {NotificationBar} from '../components/global/NotifcationBar'
import {logger} from '../api/logger'
import {useForwardToLoginWhenSignedOut} from "../lib/useForwardToLoginWhenSignedOut";

const CheckAuthWrapper = (): JSX.Element | null => {
  useForwardToLoginWhenSignedOut()
  return null
}

export function reportWebVitals(metric: NextWebVitalsMetric): void {
  logger('Analytics').trace(metric)
}

const TitleProvider = (): JSX.Element => {
  const state = useTrackedSelector()
  const name = state.globals.ready && state.globals.stageId ? state.stages.byId[state.globals.stageId].name : undefined
  return (
    <Head>
      <title>{name || 'Digital Stage'}</title>
    </Head>
  )
}

function MyApp({Component, pageProps}: AppProps): JSX.Element {
  return (
    <>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, shrink-to-fit=no, user-scalable=no"
        />
        <link rel="icon" href="/favicon.ico"/>
        <meta name="Apple-mobile-web-app-capable" content="yes"/>
        <meta name="Apple-mobile-web-app-status-bar-style" content="black"/>
        <meta name="description" content="Digital Stage"/>
      </Head>
      <DigitalStageProvider>
        <CheckAuthWrapper/>
        <TitleProvider/>
        <ConnectionOverlay>
          <div className="app">
            <Background/>
            <div className="appInner">
              <NotificationBar/>
              <Component {...pageProps} />
            </div>
            <Sidebar/>
          </div>
          <DeviceSelector/>
          <ProfileMenu/>
          <StageJoiner/>
          <PlaybackOverlay/>
        </ConnectionOverlay>
      </DigitalStageProvider>
    </>
  )
}

export default MyApp

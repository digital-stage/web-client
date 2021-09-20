import '../scripts/wdyr'
import React, {useEffect} from 'react'
import './../styles/root.css'
import './../styles/index.scss'
import Head from 'next/head'
import {AppProps, NextWebVitalsMetric} from 'next/app'
import {DigitalStageProvider, useStageSelector} from '@digitalstage/api-client-react'
import {DeviceSelector} from '../components/global/DeviceSelector'
import {Background} from 'components/global/Background'
import {Sidebar} from 'components/global/Sidebar'
import {ConnectionOverlay} from '../components/global/ConnectionOverlay'
import {ProfileMenu} from '../components/global/ProfileMenu'
import {PlaybackOverlay} from '../components/global/PlaybackOverlay'
import {StageJoiner} from '../components/global/StageJoiner'
import {useRouter} from 'next/router'
import {NotificationBar} from '../components/global/NotifcationBar'
import {logger} from '../api/logger'

const CheckAuthWrapper = () => {
  const {push, pathname} = useRouter()
  const signedOut = useStageSelector<boolean>(
    (state) => state.auth.initialized && !state.auth.user
  )
  useEffect(() => {
    if (push && signedOut && !pathname.startsWith('/account')) {
      push('/account/login')
    }
  }, [pathname, push, signedOut])
  return null
}

export function reportWebVitals(metric: NextWebVitalsMetric) {
  logger('Analytics').trace(metric)
}

const TitleProvider = (): JSX.Element => {
  const name = useStageSelector((state) =>
    state.globals.stageId ? state.stages.byId[state.globals.stageId].name : undefined
  )
  return (
    <Head>
      <title>{name || 'Digital Stage'}</title>
    </Head>
  )
}


function MyApp({Component, pageProps}: AppProps) {
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

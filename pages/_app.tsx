import '../styles/root.scss'
import {DigitalStageProvider} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import React from 'react'
import Head from 'next/Head'
import {SelectedDeviceProvider} from '../hooks/useSelectedDevice'
import {ColorProvider} from '../hooks/useColors'
import Layout from "../components/Layout";

function MyApp({Component, pageProps}) {
  const router = useRouter()

  return (
    <>
      <Head>
        <title>Digital Stage</title>
        <link href="/static/fonts/fonts.css" rel="stylesheet"/>
        <meta
          name="viewport"
          content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
        />
      </Head>
      <ColorProvider>
        <SelectedDeviceProvider>
          <DigitalStageProvider
            apiUrl={process.env.NEXT_PUBLIC_API_URL}
            authUrl={process.env.NEXT_PUBLIC_AUTH_URL}
          >
            <SelectedDeviceProvider>
              <Layout>
                {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                <Component {...pageProps} />
              </Layout>
            </SelectedDeviceProvider>
          </DigitalStageProvider>
        </SelectedDeviceProvider>
      </ColorProvider>
    </>
  )
}

export default MyApp

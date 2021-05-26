import '../styles/reset.css'
import '../styles/root.css'
import '../styles/globals.css'
import { DigitalStageProvider } from '@digitalstage/api-client-react'
import React from 'react'
import Head from 'next/head'
import { SelectedDeviceProvider } from '../hooks/useSelectedDevice'
import { ColorProvider } from '../hooks/useColors'
import Layout from '../components/Layout'
import { StageJoinerProvider } from '../hooks/useStageJoiner'
import StageJoiner from '../components/StageJoiner'
import { AudioContextProvider } from '../hooks/useAudioContext'
import AudioRendererProvider from '../hooks/useAudioRenderer'

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Head>
                <title>Digital Stage</title>
                <link href="/static/fonts/fonts.css" rel="stylesheet" />
                <meta
                    name="viewport"
                    content="initial-scale=1.0, width=device-width, shrink-to-fit=no"
                />
            </Head>
            <ColorProvider>
                <DigitalStageProvider
                    apiUrl={process.env.NEXT_PUBLIC_API_URL}
                    authUrl={process.env.NEXT_PUBLIC_AUTH_URL}
                >
                    <SelectedDeviceProvider>
                        <AudioContextProvider>
                            <AudioRendererProvider>
                                <StageJoinerProvider>
                                    <Layout>
                                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                        <Component {...pageProps} />
                                    </Layout>
                                    <StageJoiner />
                                </StageJoinerProvider>
                            </AudioRendererProvider>
                        </AudioContextProvider>
                    </SelectedDeviceProvider>
                </DigitalStageProvider>
            </ColorProvider>
        </>
    )
}

export default MyApp

import '../fastui/styles.css'
import {
    DigitalStageProvider,
    AudioContextProvider,
    AudioRenderProvider,
} from '@digitalstage/api-client-react'
import React from 'react'
import Head from 'next/head'
import { AppProps } from 'next/dist/pages/_app'
import { SelectedDeviceProvider } from '../lib/useSelectedDevice'
import { ColorProvider } from '../lib/useColors'
import Layout from '../components/Layout'
import { StageJoinerProvider } from '../lib/useStageJoiner'
import StageJoiner from '../components/StageJoiner'
import PlaybackOverlay from '../components/PlaybackOverlay'
import StreamController from '../components/global/StreamController'
import { NotificationProvider } from '../components/NotificationCenter'

function MyApp({ Component, pageProps }: AppProps) {
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
            <NotificationProvider>
                <ColorProvider>
                    <DigitalStageProvider
                        apiUrl={process.env.NEXT_PUBLIC_API_URL}
                        authUrl={process.env.NEXT_PUBLIC_AUTH_URL}
                    >
                        <SelectedDeviceProvider>
                            <AudioContextProvider>
                                <AudioRenderProvider>
                                    <StageJoinerProvider>
                                        <Layout>
                                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                            <Component {...pageProps} />
                                        </Layout>
                                        <StreamController />
                                        <StageJoiner />
                                        <PlaybackOverlay />
                                    </StageJoinerProvider>
                                </AudioRenderProvider>
                            </AudioContextProvider>
                        </SelectedDeviceProvider>
                    </DigitalStageProvider>
                </ColorProvider>
            </NotificationProvider>
        </>
    )
}

export default MyApp

import '../styles/reset.css'
import '../styles/root.css'
import '../styles/globals.css'
import { DigitalStageProvider } from '@digitalstage/api-client-react'
import React from 'react'
import Head from 'next/head'
import { SelectedDeviceProvider } from '../hooks/useSelectedDevice'
import { ColorProvider } from '../hooks/useColors'
import Layout from '../components2/Layout'
import { StageJoinerProvider } from '../hooks/useStageJoiner'
import StageJoiner from '../components2/StageJoiner'
import { AudioContextProvider } from '../hooks/useAudioContext'
import useAudioOutput from '../hooks/useAudioOutput'
import PlaybackOverlay from '../components2/PlaybackOverlay'
import StreamController from '../components2/StreamController'
import { NotificationProvider } from '../components2/NotificationCenter'
import {AudioRenderProvider} from "../components2/useAudioRenderer";

const AudioOutputSwitcher = () => {
    useAudioOutput()
    return null
}

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
                                        <AudioOutputSwitcher />
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

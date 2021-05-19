import '../styles/reset.css'
import '../styles/globals.css'
import '../styles/dark.css'
import '../styles/index.scss'
import { DigitalStageProvider } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { IntlProvider } from 'react-intl'
import React from 'react'
import Head from 'next/head'
import * as locales from '../content/locale'
import { SelectedDeviceProvider } from '../hooks/useSelectedDevice'
import PageWrapper from '../components/PageWrapper'
import { ColorProvider } from '../hooks/useColors'
import { NotificationProvider } from '../hooks/useNotification'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
    const router = useRouter()
    const { locale, defaultLocale } = router
    const localeCopy = locales[locale]
    const messages = localeCopy.default

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
            <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages}>
                <NotificationProvider>
                    <ColorProvider>
                        <SelectedDeviceProvider>
                            <DigitalStageProvider
                                apiUrl={process.env.NEXT_PUBLIC_API_URL}
                                authUrl={process.env.NEXT_PUBLIC_AUTH_URL}
                            >
                                <SelectedDeviceProvider>
                                    <PageWrapper>
                                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                                        <Component {...pageProps} />
                                    </PageWrapper>
                                </SelectedDeviceProvider>
                            </DigitalStageProvider>
                        </SelectedDeviceProvider>
                    </ColorProvider>
                </NotificationProvider>
            </IntlProvider>
        </>
    )
}

export default MyApp

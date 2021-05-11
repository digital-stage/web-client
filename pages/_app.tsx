import '../styles/globals.css'
import '../styles/dark.css'
import { DigitalStageProvider } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { IntlProvider } from 'react-intl'
import React from 'react'
import * as locales from '../content/locale'
import { SelectedDeviceProvider } from '../hooks/useSelectedDevice'
import PageWrapper from '../components/PageWrapper'

// eslint-disable-next-line react/prop-types
function MyApp({ Component, pageProps }) {
    const router = useRouter()
    const { locale, defaultLocale } = router
    const localeCopy = locales[locale]
    const messages = localeCopy.default

    return (
        <IntlProvider locale={locale} defaultLocale={defaultLocale} messages={messages}>
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
        </IntlProvider>
    )
}

export default MyApp

import '../styles/globals.css'
import '../styles/dark.css'
import {DigitalStageProvider} from "@digitalStage/api-client-react";
import {useRouter} from "next/router";
import {IntlProvider} from "react-intl";
import React, {Component} from "react";
import * as locales from "../content/locale"

function MyApp({Component, pageProps}) {
  const router = useRouter();
  const {locale, defaultLocale} = router;
  const localeCopy = locales[locale]
  const messages = localeCopy["default"]

  return (
    <IntlProvider
      locale={locale}
      defaultLocale={defaultLocale}
      messages={messages}
    >
      <DigitalStageProvider apiUrl={process.env.NEXT_PUBLIC_API_URL} authUrl={process.env.NEXT_PUBLIC_AUTH_URL}>
        <Component {...pageProps} />
      </DigitalStageProvider>
    </IntlProvider>
  )
}

export default MyApp

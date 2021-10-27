// next.config.js
const {withSentryConfig} = require('@sentry/nextjs')

const moduleExports = {
    // Your existing module.exports
    reactStrictMode: true,
    eslint: {
        dirs: ['api', 'components', 'lib', 'pages', 'ui'],
    },
    serverRuntimeConfig: {
        // Will only be available on the server side
        apiUrl: process.env.NEXT_PUBLIC_API_URL, // Pass through env variables
        authUrl: process.env.NEXT_PUBLIC_AUTH_URL, // Pass through env variables
    },
}

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
}

module.exports = (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) ? withSentryConfig(moduleExports, sentryWebpackPluginOptions) : moduleExports
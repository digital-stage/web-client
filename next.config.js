// next.config.js
const { withSentryConfig } = require('@sentry/nextjs');

const moduleExports = {
    // Your existing module.exports
    reactStrictMode: true,
    eslint: {
        dirs: ['client', 'components', 'lib', 'pages', 'ui'],
    },
    serverRuntimeConfig: {
        // Will only be available on the server side
        apiUrl: process.env.NEXT_PUBLIC_API_URL,
        authUrl: process.env.NEXT_PUBLIC_AUTH_URL,
        jnUrl: process.env.NEXT_PUBLIC_JN_DOWNLOAD_URL,
        logUrl: process.env.NEXT_PUBLIC_LOG_URL
    },
};

const sentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
};

//module.exports = moduleExports
module.exports = (process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN) ? require('@sentry/nextjs').withSentryConfig(moduleExports, sentryWebpackPluginOptions) : moduleExports
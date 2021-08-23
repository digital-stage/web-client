// next.config.js
//const { withSentryConfig } = require('@sentry/nextjs')

const moduleExports = {
    // Your existing module.exports
    reactStrictMode: true
}

const SentryWebpackPluginOptions = {
    // Additional config options for the Sentry Webpack plugin. Keep in mind that
    // the following options are set automatically, and overriding them is not
    // recommended:
    //   release, url, org, project, authToken, configFile, stripPrefix,
    //   urlPrefix, include, ignore

    silent: true, // Suppresses all logs
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options.
}

const withTM = require('next-transpile-modules')(['konva', 'react-konva'])
module.exports = withTM(moduleExports)
//module.exports = withTM(withSentryConfig(moduleExports, SentryWebpackPluginOptions))

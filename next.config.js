module.exports = {
    webpack: function (config) {
        config.externals = config.externals || {}
        config.externals['styletron-server'] = 'styletron-server'
        return config
    },
    i18n: {
        locales: ['de', 'en'],
        defaultLocale: 'de',
        domains: [
            {
                domain: 'live.digital-stage.org',
                defaultLocale: 'de'
            },
            {
                domain: 'test.digital-stage.org',
                defaultLocale: 'de'
            }
        ]
    }
}

module.exports = {
    future: {
        webpack5: true,
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

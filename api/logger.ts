import debug from 'debug'
import Pino from 'pino'
import { logflarePinoVercel } from 'pino-logflare'

const useLogFlare: boolean =
    !!process.env.NEXT_PUBLIC_LOGFLARE_API_KEY && !!process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN

let logger: Pino.Logger
if (useLogFlare) {
    const { stream, send } = logflarePinoVercel({
        apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
        sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
    })
    logger = Pino(
        {
            browser: {
                transmit: {
                    level: 'info',
                    send: send,
                },
            },
            level: 'debug',
            base: {
                env: process.env.NODE_ENV,
                revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
            },
        },
        stream
    )
} else {
    logger = Pino({
        level: 'trace',
        base: {
            env: process.env.NODE_ENV,
            revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
        },
    })
}

debug.log = function (s, ...args) {
    logger.trace(s, ...args)
    //logger.trace(util.format(s, ...args))
}

export { debug as trace }

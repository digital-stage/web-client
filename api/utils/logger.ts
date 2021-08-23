import pino from 'pino'
import { logflarePinoVercel } from 'pino-logflare'

const { stream, send } = logflarePinoVercel({
    apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
    sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
})

const logger = pino(
    {
        browser: {
            transmit: {
                level: 'info',
                send: send,
            },
        },
        level: process.env.NODE_ENV === 'development' ? 'trace' : 'debug',
        base: {
            env: process.env.NODE_ENV,
            revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
        },
    },
    stream
)
export default logger

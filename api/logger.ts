import debug from 'debug'
import Pino, {LogFn} from 'pino'

let pinoLogger: Pino.Logger = Pino(
    {
        level: 'debug',
        base: {
            env: process.env.VERCEL_ENV || process.env.NODE_ENV,
            url: process.env.VERCEL_URL,
            revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
            commit: process.env.VERCEL_GIT_COMMIT_MESSAGE
        },
    })

debug.log = function (s, ...args) {
    pinoLogger.debug(s, ...args)
}
const webclientReport = debug("webclient")

interface Debugger {
    trace: debug.Debugger,
    warn: LogFn
    reportError: LogFn
}

function logger(namespace: string, delimiter?: string): Debugger {
    const specializedReport = webclientReport.extend(namespace, delimiter)
    return {
        trace: specializedReport,
        warn: (msg: string, ...args: any[]) => pinoLogger.warn(msg, args),
        reportError: (msg: string, ...args: any[]) => pinoLogger.error(msg, args)
    }
}

export {logger}

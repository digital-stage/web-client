import debug from 'debug'
import Pino, {LogFn} from 'pino'
import {logflarePinoVercel} from 'pino-logflare'

const useLogFlare: boolean =
  !!process.env.NEXT_PUBLIC_LOGFLARE_API_KEY && !!process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN

let pinoLogger: Pino.Logger
if (useLogFlare) {
  console.info("Using logflare for logging")
  const {stream, send} = logflarePinoVercel({
    apiKey: process.env.NEXT_PUBLIC_LOGFLARE_API_KEY,
    sourceToken: process.env.NEXT_PUBLIC_LOGFLARE_SOURCE_TOKEN,
  })
  pinoLogger = Pino(
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
  pinoLogger = Pino({
    level: 'trace',
    base: {
      env: process.env.NODE_ENV,
      revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
    },
  })
}

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

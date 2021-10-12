/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import debug from 'debug'
import Pino, {LogFn} from 'pino'

const pinoLogger: Pino.Logger = Pino(
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

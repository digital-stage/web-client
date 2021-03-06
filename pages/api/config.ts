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
import type {NextApiRequest, NextApiResponse} from "next"
import getConfig from 'next/config'
import {withSentry} from "@sentry/nextjs";

const {serverRuntimeConfig} = getConfig()

interface EnvConfig {
  apiUrl: string
  authUrl: string
  jnUrl: string
  logUrl?: string
}

const handler = async (req: NextApiRequest, res: NextApiResponse): Promise<void> => {
  const config: EnvConfig = {
    apiUrl: serverRuntimeConfig.apiUrl,
    authUrl: serverRuntimeConfig.authUrl,
    jnUrl: serverRuntimeConfig.jnUrl,
    logUrl: serverRuntimeConfig.logUrl
  }
  res.status(200).json(config)
}
export default withSentry(handler)

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

export interface KIND {
  info: 'info'
  warn: 'warn'
  success: 'success'
  error: 'error'
}

export interface Notification {
  id: string
  date: number
  kind: KIND[keyof KIND]
  message: string
  link?: string
  stack?: string
  featured: boolean
  featureTimeout?: number
  closeable: boolean
}

export interface Notifications {
  checks: {
    isOvRunning: boolean,
    hasOvDeviceOrderId: boolean,
    isJammerRunning: boolean,
    [name: string]: boolean
  },
  byId: {
    [id: string]: Notification
  },
  success: string[],
  info: string[],
  warning: string[],
  error: string[],
  allIds: string[]
}
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

import {AuthUser} from './redux/state/Auth'

export const ErrorCodes = {
  Unauthorized: 401,
  NotActivated: 424,
  NotFound: 404,
  BadRequest: 400,
  EmailAlreadyInUse: 409,
  AlreadyActivated: 416,
  InternalError: 500,
  InvalidToken: 403,
}

export class AuthError extends Error {
  public readonly code: number

  constructor(code: number, message?: string) {
    super(message)
    this.name = 'AuthError'
    Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain
    this.code = code
  }
}

const getUserByToken = (url: string, token: string): Promise<AuthUser> =>
  fetch(`${url}/profile`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })
    .then((result) => {
      if (result.ok) {
        return result.json()
      }
      throw new AuthError(result.status, result.statusText)
    })
    .then((json) => json as AuthUser)

const createUserWithEmailAndPassword = (
  url: string,
  email: string,
  password: string,
  name: string,
  avatarUrl?: string
): Promise<void> =>
  fetch(`${url}/signup`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
      name,
      avatarUrl: avatarUrl || '',
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new AuthError(res.status, res.statusText)
    }
    return undefined
  })

const signInWithEmailAndPassword = (
  url: string,
  email: string,
  password: string
): Promise<string> =>
  fetch(`${url}/login`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  })
    .then((res) => {
      if (res.ok) return res.json()
      throw new AuthError(res.status, res.statusText)
    })

const signInWithToken = (
  url: string, token: string): Promise<AuthUser> => getUserByToken(url, token)

const requestPasswordReset = (url: string, email: string): Promise<void> =>
  fetch(`${url}/forgot`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  }).then((res) => {
    if (!res.ok) throw new AuthError(res.status, res.statusText)
    return undefined
  })

const resetPassword = (url: string, resetToken: string, password: string): Promise<void> =>
  fetch(`${url}/reset`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      token: resetToken,
      password,
    }),
  }).then((res) => {
    if (!res.ok) {
      throw new AuthError(res.status, res.statusText)
    }
    return undefined
  })

const activate = (url: string, code: string): Promise<void> =>
  fetch(`${url}/activate`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      code,
    }),
  }).then((res) => {
    if (!res.ok) throw new AuthError(res.status, res.statusText)
    return undefined
  })

const resendActivationLink = (url: string, email: string): Promise<void> =>
  fetch(`${url}/reactivate`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      email,
    }),
  }).then((res) => {
    if (!res.ok) throw new AuthError(res.status, res.statusText)
    return undefined
  })

export const logout = (url: string, token: string): Promise<void> =>
  fetch(`${url}/logout`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    method: 'POST',
  }).then((res) => {
    if (!res.ok) throw new AuthError(res.status, res.statusText)
    return undefined
  })

export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithToken,
  getUserByToken,
  activate,
  requestPasswordReset,
  resendActivationLink,
  resetPassword,
}

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

import { AuthError, ErrorCodes } from '@digitalstage/api-client-react'

const translateError = (error: AuthError): string => {
    if ((error as AuthError).code !== undefined) {
        const authError = error as AuthError
        switch (authError.code) {
            case ErrorCodes.Unauthorized: {
                return 'Unbekannte E-Mail-Adresse oder falsches Passwort'
            }
            case ErrorCodes.NotActivated: {
                return 'Bitte aktiviere Deinen Account!'
            }
            case ErrorCodes.NotFound: {
                return 'E-Mail Adresse nicht gefunden!'
            }
            case ErrorCodes.EmailAlreadyInUse: {
                return 'Die E-Mail-Adresse wird bereits genutzt!'
            }
            case ErrorCodes.InvalidToken: {
                return 'Ungültiger oder abgelaufener Code'
            }
            case ErrorCodes.AlreadyActivated: {
                return 'Der Account wurde bereits aktiviert'
            }
            case ErrorCodes.InternalError: {
                return 'Fehler im Backend - bitte kontaktiere den technischen Support'
            }
            case ErrorCodes.BadRequest: {
                return 'Fehler im Frontend - bitte kontaktiere den technischen Support'
            }
            default: {
                return `Unbekannter Fehler: ${authError.code}: ${authError.message} - bitte kontaktiere den technischen Support`
            }
        }
    }
    return `Unbekannter Fehler: ${error.message} - bitte kontaktiere den technischen Support`
}
export {translateError}

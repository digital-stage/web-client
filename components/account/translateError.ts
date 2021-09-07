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

import React from 'react'
import { useRouter } from 'next/router'
import ResetPasswordForm from '../../components2/forms/ResetPasswordForm'
import AuthLayout from '../../ui/AuthLayout'

const Reset = () => {
    const { query } = useRouter()

    const resetToken = Array.isArray(query.resetToken) ? query.resetToken[0] : query.resetToken
    return (
        <AuthLayout>
            <h3>Passwort zurücksetzen</h3>
            <p className="micro">
                Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein kleiner und ein
                großer Buchstabe sowie insgesamt eine Länge von 8 Zeichen haben.
            </p>
            <ResetPasswordForm resetToken={resetToken} />
        </AuthLayout>
    )
}
export default Reset

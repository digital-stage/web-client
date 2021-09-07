import React from 'react'
import { useRouter } from 'next/router'
import {ResetPasswordForm} from 'components/account/ResetPasswordForm'
import {AuthLayout} from 'components/account/AuthLayout'
import {Paragraph} from '../../ui/Paragraph'

const Reset = () => {
    const { query } = useRouter()

    const resetToken = Array.isArray(query.resetToken) ? query.resetToken[0] : query.resetToken
    return (
        <AuthLayout>
            <h3>Passwort zurücksetzen</h3>
            <Paragraph kind="micro">
                Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein kleiner und ein
                großer Buchstabe sowie insgesamt eine Länge von 8 Zeichen haben.
            </Paragraph>
            <ResetPasswordForm resetToken={resetToken} />
        </AuthLayout>
    )
}
export default Reset

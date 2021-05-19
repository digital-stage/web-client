import React from 'react'
import { useRouter } from 'next/router'
import AuthContainer from '../../components/AuthContainer'
import Block from '../../components/ui/Block'
import ResetPasswordForm from '../../components/forms/ResetPasswordForm'

const Reset = () => {
    const { query } = useRouter()

    const resetToken = Array.isArray(query.resetToken) ? query.resetToken[0] : query.resetToken
    return (
        <AuthContainer>
            <Block vertical>
                <h3>Passwort zurücksetzen</h3>
                <p className="micro">
                    Das Passwort muss folgendes beinhalten: mindestens eine Zahl, ein kleiner und
                    ein großer Buchstabe sowie insgesamt eine Länge von 8 Zeichen haben.
                </p>
            </Block>
            <ResetPasswordForm resetToken={resetToken} />
        </AuthContainer>
    )
}
export default Reset

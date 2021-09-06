import React from 'react'
import Link from 'next/link'
import {AuthLayout} from 'components/account/AuthLayout'
import {ForgetPasswordForm} from 'components/account/ForgetPasswordForm'
import {Paragraph} from '../../ui/Paragraph'

const Forgot = () => {
    return (
        <AuthLayout>
            <h3>Passwort vergessen?</h3>
            <Paragraph kind="micro">
                Bitte gebe Deine E-Mail Adresse unten ein und wir senden Dir einen Link zur Vergabe
                eines neuen Passwortes zu!
            </Paragraph>
            <ForgetPasswordForm />
            <Link href="/account/login" passHref>
                <a className="text">Zurück</a>
            </Link>
        </AuthLayout>
    )
}
export default Forgot

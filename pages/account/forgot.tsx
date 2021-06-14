import React from 'react'
import Link from 'next/link'
import ForgetPasswordForm from '../../components/forms/ForgetPasswordForm'
import AuthLayout from '../../ui/AuthLayout'
import TextLink from '../../ui/TextLink'

const Forgot = () => {
    return (
        <AuthLayout>
            <h3>Passwort vergessen?</h3>
            <p className="micro">
                Bitte gebe Deine E-Mail Adresse unten ein und wir senden Dir einen Link zur Vergabe
                eines neuen Passwortes zu!
            </p>
            <ForgetPasswordForm />
            <Link href="/account/login" passHref>
                <TextLink>Zurück</TextLink>
            </Link>
        </AuthLayout>
    )
}
export default Forgot

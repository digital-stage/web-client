import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import AuthContainer from '../../components/AuthContainer'
import Block from '../../components/ui/Block'
import ForgetPasswordForm from '../../components/forms/ForgetPasswordForm'

const Forgot = () => {
    const { loading, user } = useAuth()
    const { push } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    return (
        <AuthContainer>
            <Block paddingBottom={2}>
                <h3>Passwort vergessen?</h3>
            </Block>
            <Block paddingBottom={4}>
                <p className="micro">
                    Bitte gebe Deine E-Mail Adresse unten ein und wir senden Dir einen Link zur
                    Vergabe eines neuen Passwortes zu!
                </p>
            </Block>
            <ForgetPasswordForm />
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/login" passHref>
                    <a>Zurück</a>
                </Link>
            </Block>
        </AuthContainer>
    )
}
export default Forgot

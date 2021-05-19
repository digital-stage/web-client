import React from 'react'
import Link from 'next/link'
import AuthContainer from '../../components/AuthContainer'
import LoginForm from '../../components/forms/LoginForm'
import Block from '../../components/ui/Block'
import { SecondaryHeadlineLink } from '../../components/ui/HeadlineLink'

const Login = () => {
    return (
        <AuthContainer>
            <Block paddingBottom={4}>
                <Block width={6}>
                    <SecondaryHeadlineLink href="/account/login">Login</SecondaryHeadlineLink>
                </Block>
                <Block width={6}>
                    <SecondaryHeadlineLink href="/account/signup">
                        Registrieren
                    </SecondaryHeadlineLink>
                </Block>
            </Block>
            <LoginForm />
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/forgot" passHref>
                    <a>Passwort vergessen?</a>
                </Link>
            </Block>
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/activate" passHref>
                    <a>Konto aktivieren</a>
                </Link>
            </Block>
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/reactivate" passHref>
                    <a>Kein Aktivierungscode erhalten?</a>
                </Link>
            </Block>
        </AuthContainer>
    )
}
export default Login

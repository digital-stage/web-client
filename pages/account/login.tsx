import LoginForm from 'components/account/LoginForm'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import AuthLayout from 'components/global/AuthLayout'
import { useStageSelector } from '@digitalstage/api-client-react'

const Login = () => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const { push } = useRouter()

    useEffect(() => {
        if (signedIn) {
            push('/')
        }
    }, [push, signedIn])

    return (
        <AuthLayout showMenu>
            <LoginForm />
            <Link href="/account/forgot" passHref>
                <a className="text">Passwort vergessen?</a>
            </Link>
            <Link href="/account/activate" passHref>
                <a className="text">Konto aktivieren</a>
            </Link>
            <Link href="/account/reactivate" passHref>
                <a className="text">Kein Aktivierungscode erhalten?</a>
            </Link>
        </AuthLayout>
    )
}
export default Login

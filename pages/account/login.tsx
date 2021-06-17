import React, { useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import LoginForm from '../../components/account/forms/LoginForm'
import AuthLayout from '../../ui/AuthLayout'
import TextLink from '../../ui/TextLink'

const Login = () => {
    const { loading, user } = useAuth()
    const { push } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    return (
        <AuthLayout showMenu>
            <LoginForm />
            <Link href="/account/forgot" passHref>
                <TextLink>Passwort vergessen?</TextLink>
            </Link>
            <Link href="/account/activate" passHref>
                <TextLink>Konto aktivieren</TextLink>
            </Link>
            <Link href="/account/reactivate" passHref>
                <TextLink>Kein Aktivierungscode erhalten?</TextLink>
            </Link>
        </AuthLayout>
    )
}
export default Login

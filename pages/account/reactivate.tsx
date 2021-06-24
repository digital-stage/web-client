import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import Link from 'next/link'
import ResendActivationForm from '../../components/account/forms/ResendActivationForm'
import AuthLayout from '../../fastui/components/AuthLayout'
import TextLink from '../../fastui/components/interaction/TextLink'

const ReActivate = () => {
    const { loading, user } = useAuth()
    const { push } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    return (
        <AuthLayout>
            <h4>Aktivierungscode erneut senden</h4>
            <p className="micro">
                Gibt Deine E-Mail-Adresse ein, um erneut einen Aktivierungscode zu beantragen
            </p>
            <ResendActivationForm />
            <Link href="/account/login" passHref>
                <TextLink>Zurück</TextLink>
            </Link>
        </AuthLayout>
    )
}
export default ReActivate

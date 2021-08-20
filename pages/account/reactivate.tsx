import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useStageSelector } from '@digitalstage/api-client-react'
import Link from 'next/link'
import ResendActivationForm from 'components/account/ResendActivationForm'
import AuthLayout from 'components/account/AuthLayout'
import Paragraph from '../../ui/Paragraph'

const ReActivate = () => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const { push } = useRouter()

    useEffect(() => {
        if (signedIn) {
            push('/')
        }
    }, [push, signedIn])

    return (
        <AuthLayout>
            <h4>Aktivierungscode erneut senden</h4>
            <Paragraph kind="micro">
                Gibt Deine E-Mail-Adresse ein, um erneut einen Aktivierungscode zu beantragen
            </Paragraph>
            <ResendActivationForm />
            <Link href="/account/login" passHref>
                <a className="text">Zurück</a>
            </Link>
        </AuthLayout>
    )
}
export default ReActivate

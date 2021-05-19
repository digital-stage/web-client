import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import Link from 'next/link'
import AuthContainer from '../../components/AuthContainer'
import Block from '../../components/ui/Block'
import ResendActivationForm from '../../components/forms/ResendActivationForm'

const ReActivate = () => {
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
                <h4>Aktivierungscode erneut senden</h4>
            </Block>
            <Block paddingBottom={4}>
                <p className="micro">
                    Gibt Deine E-Mail-Adresse ein, um erneut einen Aktivierungscode zu beantragen
                </p>
            </Block>
            <ResendActivationForm />
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/login" passHref>
                    <a>Zurück</a>
                </Link>
            </Block>
        </AuthContainer>
    )
}
export default ReActivate

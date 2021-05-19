import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import Link from 'next/link'
import AuthContainer from '../../components/AuthContainer'
import Block from '../../components/ui/Block'
import ActivationForm from '../../components/forms/ActivationForm'

const Activate = () => {
    const { loading, user } = useAuth()
    const { push, query } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    const initialCode = Array.isArray(query.code) ? query.code[0] : query.code
    return (
        <AuthContainer>
            <Block paddingBottom={2}>
                <h3>Konto aktivieren</h3>
            </Block>
            <Block paddingBottom={4}>
                <p className="micro">
                    Bitte gebe den Aktivierungscode ein, welchen Du per E-Mail von uns erhalten
                    hast:
                </p>
            </Block>
            <ActivationForm initialCode={initialCode} />
            <Block width={12} align="center" paddingTop={4}>
                <Link href="/account/login" passHref>
                    <a>Zurück</a>
                </Link>
            </Block>
        </AuthContainer>
    )
}
export default Activate

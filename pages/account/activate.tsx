import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import {ActivationForm} from 'components/account/ActivationForm'
import { useStageSelector } from '@digitalstage/api-client-react'
import {AuthLayout} from 'components/account/AuthLayout'
import {Paragraph} from '../../ui/Paragraph'

const Activate = () => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const { push, query } = useRouter()

    useEffect(() => {
        if (signedIn) {
            push('/')
        }
    }, [push, signedIn])

    const initialCode = Array.isArray(query.code) ? query.code[0] : query.code
    return (
        <AuthLayout>
            <h3>Konto aktivieren</h3>
            <Paragraph kind="micro">
                Bitte gebe den Aktivierungscode ein, welchen Du per E-Mail von uns erhalten hast:
            </Paragraph>
            <ActivationForm initialCode={initialCode} />
            <Link href="/account/login" passHref>
                <a className="text">Zurück</a>
            </Link>
        </AuthLayout>
    )
}
export default Activate

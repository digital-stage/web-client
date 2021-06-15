import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '@digitalstage/api-client-react'
import Link from 'next/link'
import ActivationForm from '../../components2/forms/ActivationForm'
import AuthLayout from '../../ui/AuthLayout'
import TextLink from '../../ui/TextLink'

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
        <AuthLayout>
            <h3>Konto aktivieren</h3>
            <p className="micro">
                Bitte gebe den Aktivierungscode ein, welchen Du per E-Mail von uns erhalten hast:
            </p>
            <ActivationForm initialCode={initialCode} />
            <Link href="/account/login" passHref>
                <TextLink>Zurück</TextLink>
            </Link>
        </AuthLayout>
    )
}
export default Activate

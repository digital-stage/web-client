import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import Block from '../../components/ui/Block'
import { SecondaryHeadlineLink } from '../../components/ui/HeadlineLink'
import AuthContainer from '../../components/AuthContainer'
import SignUpForm from '../../components/forms/SignUpForm'

const SignUp = () => {
    const { loading, user } = useAuth()
    const { push } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

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
            <SignUpForm />
        </AuthContainer>
    )
}
export default SignUp

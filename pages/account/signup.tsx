import React from 'react'
import Block from '../../components/ui/Block'
import { SecondaryHeadlineLink } from '../../components/ui/HeadlineLink'
import AuthContainer from '../../components/AuthContainer'
import SignUpForm from '../../components/forms/SignUpForm'

const SignUp = () => {
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

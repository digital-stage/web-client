import React, { useEffect } from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import SignUpForm from 'components/account/SignUpForm'
import AuthLayout from 'components/global/AuthLayout'

const SignUp = () => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const { push } = useRouter()

    useEffect(() => {
        if (push && signedIn) {
            console.log('SIGNED IN')
            push('/')
        }
    }, [push, signedIn])

    return (
        <AuthLayout showMenu>
            <SignUpForm />
        </AuthLayout>
    )
}
export default SignUp

import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import SignUpForm from '../../components/forms/SignUpForm'
import AuthLayout from '../../ui/AuthLayout'

const SignUp = () => {
    const { loading, user } = useAuth()
    const { push } = useRouter()

    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])

    return (
        <AuthLayout showMenu>
            <SignUpForm />
        </AuthLayout>
    )
}
export default SignUp

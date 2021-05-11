import { useRouter } from 'next/router'
import React, { useEffect } from 'react'

import { useAuth } from '@digitalstage/api-client-react'
import AuthNavigation from '../../components/account/AuthNavigation'
import SignUpForm from '../../components/account/forms/SignUpForm'
import styles from '../../styles/Account.module.css'

const SignUp = () => {
    const { loading, user } = useAuth()
    const { push, prefetch } = useRouter()
    useEffect(() => {
        if (prefetch) {
            prefetch('/account/login')
        }
    }, [prefetch])
    useEffect(() => {
        if (push && !loading && user) {
            push('/')
        }
    }, [user, loading, push])
    return (
        <div className={styles.wrapper}>
            <img alt="Digital Stage" className={styles.logo} src="/static/logo-full.svg" />
            <div className={styles.panel}>
                <AuthNavigation />
                <SignUpForm />
            </div>
        </div>
    )
}
export default SignUp

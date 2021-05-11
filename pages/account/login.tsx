/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useEffect } from 'react'
import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import Link from 'next/link'
import styles from '../../styles/Account.module.css'
import AuthNavigation from '../../components/account/AuthNavigation'
import LoginForm from '../../components/account/forms/LoginForm'

const Login = () => {
    const { loading, user } = useAuth()
    const { push, prefetch } = useRouter()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    useEffect(() => {
        if (prefetch) {
            prefetch('/account/signup')
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
                <LoginForm />
                <Link href="/account/forgot" passHref>
                    <a className={styles.link}>{f('forgotPassword')}</a>
                </Link>
                <Link href="/account/reactivate" passHref>
                    <a className={styles.link}>{f('resendActivationLink')}</a>
                </Link>
            </div>
        </div>
    )
}
export default Login

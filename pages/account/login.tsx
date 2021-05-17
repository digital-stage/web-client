/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react'
import {useAuth} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import {useIntl} from 'react-intl'
import Link from 'next/link'
import LoginForm from '../../components/account/forms/LoginForm'
import styles from "../../styles/Auth.module.scss"

const Login = () => {
  const {loading, user} = useAuth()
  const {push, prefetch} = useRouter()
  const {formatMessage} = useIntl()
  const f = (id) => formatMessage({id})

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
    <div className={styles.container}>
      <header>
        <Link href="/account/login" passHref>
          <a>
            {f('login')}
          </a>
        </Link>
        <Link href="/account/signup" passHref>
          <a>
            {f('signUp')}
          </a>
        </Link>
      </header>
      <LoginForm/>
      <Link href="/account/forgot" passHref>
        <a>{f('forgotPassword')}</a>
      </Link>
      <Link href="/account/reactivate" passHref>
        <a>{f('resendActivationLink')}</a>
      </Link>
    </div>
  )
}
export default Login

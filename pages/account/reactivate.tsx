/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react'
import {useAuth} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import {useIntl} from 'react-intl'
import Link from 'next/link'
import styles from '../../styles/Account.module.css'
import AuthNavigation from '../../components/account/AuthNavigation'
import LoginForm from '../../components/account/forms/LoginForm'
import AuthContainer from "../../components/account/AuthContainer";
import ForgetPasswordForm from "../../components/account/forms/ForgetPasswordForm";
import TertiaryButton from "../../ui/button/TertiaryButton";
import ResendActivationForm from "../../components/account/forms/ResendActivationForm";

const Login = () => {
  const {loading, user} = useAuth()
  const {push, prefetch} = useRouter()
  const {formatMessage} = useIntl()
  const f = (id) => formatMessage({id})

  useEffect(() => {
    if (push && !loading && user) {
      push('/')
    }
  }, [user, loading, push])

  return (
    <AuthContainer>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>{f('sendActivationLink')}</h3>
        <p className={`${styles.formText} micro`}>{f('enterEmailToActivate')}</p>
      </div>
      <ResendActivationForm/>
      <Link href="/account/login" passHref>
        <a className={styles.link}>{f('cancel')}</a>
      </Link>
    </AuthContainer>
  )
}
export default Login

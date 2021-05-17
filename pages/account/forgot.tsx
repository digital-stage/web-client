/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react'
import {useAuth} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import {useIntl} from 'react-intl'
import Link from 'next/link'
import ForgetPasswordForm from "../../components/account/forms/ForgetPasswordForm";
import AuthFormLink from "../../ui/new/auth/AuthForm/AuthFormLink";

const Login = () => {
  const {loading, user} = useAuth()
  const {push} = useRouter()
  const {formatMessage} = useIntl()
  const f = (id) => formatMessage({id})

  useEffect(() => {
    if (push && !loading && user) {
      push('/')
    }
  }, [user, loading, push])

  return (
    <div className="auth container">
      <div className="header">
        <h3>{f('resetPassword')}</h3>
        <p className="micro">{f('enterEmailToReset')}</p>
      </div>
      <ForgetPasswordForm/>
      <Link href="/account/login" passHref>
        <AuthFormLink>{f('cancel')}</AuthFormLink>
      </Link>
    </div>
  )
}
export default Login

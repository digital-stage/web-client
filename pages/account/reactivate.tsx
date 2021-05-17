/* eslint-disable jsx-a11y/anchor-is-valid */
import React, {useEffect} from 'react'
import {useAuth} from '@digitalstage/api-client-react'
import {useRouter} from 'next/router'
import {useIntl} from 'react-intl'
import Link from 'next/link'
import ResendActivationForm from "../../components/account/forms/ResendActivationForm";
import AuthContainer from "../../ui/new/auth/AuthContainer";
import AuthFormHeader from "../../ui/new/auth/AuthForm/AuthFormHeader";
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
    <AuthContainer>
      <AuthFormHeader>
        <h3>{f('sendActivationLink')}</h3>
        <p className="micro">{f('enterEmailToActivate')}</p>
      </AuthFormHeader>
      <ResendActivationForm/>
      <Link href="/account/login" passHref>
        <AuthFormLink>{f('cancel')}</AuthFormLink>
      </Link>
    </AuthContainer>
  )
}
export default Login

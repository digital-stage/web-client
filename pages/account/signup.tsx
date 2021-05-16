import {useRouter} from 'next/router'
import React, {useEffect} from 'react'

import {useAuth} from '@digitalstage/api-client-react'
import AuthNavigation from '../../components/account/AuthNavigation'
import SignUpForm from '../../components/account/forms/SignUpForm'
import AuthContainer from "../../components/account/AuthContainer";

const SignUp = () => {
  const {loading, user} = useAuth()
  const {push, prefetch} = useRouter()
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
    <AuthContainer>
      <AuthNavigation/>
      <SignUpForm/>
    </AuthContainer>
  )
}
export default SignUp

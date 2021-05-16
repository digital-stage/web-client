import {useRouter} from 'next/router'
import React from 'react'
import ActivationForm from '../../components/account/forms/ActivationForm'
import AuthContainer from "../../components/account/AuthContainer";

const Activate = (): JSX.Element => {
  const {query} = useRouter()

  const initialCode = Array.isArray(query.code) ? query.code[0] : query.code

  return <AuthContainer><ActivationForm initialCode={initialCode}/></AuthContainer>
}

export default Activate

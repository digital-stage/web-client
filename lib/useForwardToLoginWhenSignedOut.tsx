import {useStageSelector} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import React, {useEffect} from "react";

const useForwardToLoginWhenSignedOut = () => {
  const {isReady, pathname, replace} = useRouter()
  const signedOut = useStageSelector<boolean>(
    (state) => state.auth.initialized && !state.auth.user
  )
  useEffect(() => {
    if (isReady && signedOut && !pathname.startsWith('/account')) {
      replace('/account/login')
    }
  }, [isReady, pathname, replace, signedOut])
  return null
}
export {useForwardToLoginWhenSignedOut}
import {selectSignedOut, useTrackedSelector} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import React, {useEffect} from "react";

const useForwardToLoginWhenSignedOut = () => {
  const {isReady, pathname, replace} = useRouter()
  const state = useTrackedSelector()
  const signedOut = selectSignedOut(state)
  useEffect(() => {
    if (isReady && signedOut && !pathname.startsWith('/account')) {
      replace('/account/login')
    }
  }, [isReady, pathname, replace, signedOut])
  return null
}
export {useForwardToLoginWhenSignedOut}
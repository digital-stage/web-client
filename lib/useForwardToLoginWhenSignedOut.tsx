import {selectSignedOut, useTrackedSelector} from "../client";
import {useRouter} from "next/router";
import React from "react";

const useForwardToLoginWhenSignedOut = (): JSX.Element | null => {
  const {isReady, pathname, replace} = useRouter()
  const state = useTrackedSelector()
  const signedOut = selectSignedOut(state)
  React.useEffect(() => {
    if (isReady && signedOut && !pathname.startsWith('/account')) {
      replace('/account/login')
    }
  }, [isReady, pathname, replace, signedOut])
  return null
}
export {useForwardToLoginWhenSignedOut}
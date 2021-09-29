import {useStageSelector} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import React from "react";

const useForwardToStagesWhenSignedIn = () => {
  const {isReady, push, prefetch} = useRouter()
  const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
  React.useEffect(() => {
    prefetch("/")
  }, [prefetch])
  React.useEffect(() => {
    if (isReady && signedIn) {
      push("/")
    }
  }, [isReady, signedIn, push])
  return null
}
export {useForwardToStagesWhenSignedIn}
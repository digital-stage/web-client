import {selectSignedIn, useTrackedSelector} from "@digitalstage/api-client-react";
import {useRouter} from "next/router";
import React from "react";

const useForwardToStagesWhenSignedIn = () => {
  const {isReady, push, prefetch} = useRouter()
  const state = useTrackedSelector()
  const signedIn = selectSignedIn(state)
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
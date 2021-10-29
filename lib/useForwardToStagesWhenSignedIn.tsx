import {selectSignedIn, useTrackedSelector} from "../client";
import {useRouter} from "next/router";
import React from "react";

const useForwardToStagesWhenSignedIn = (): JSX.Element | null => {
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
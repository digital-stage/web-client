/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from "react";
import {useErrorReporting, useStageSelector} from "@digitalstage/api-client-react";
import {VideoTrack} from "@digitalstage/api-types";


type State = MediaStreamTrack
type Dispatch = React.Dispatch<React.SetStateAction<State>>

const WebcamStateContext = React.createContext<State>(null)
const WebcamDispatchContext = React.createContext<Dispatch>(null)

const WebcamProvider = ({children}: { children: React.ReactNode }) => {
  const [state, dispatch] = React.useState<MediaStreamTrack>()
  const videoTracks = useStageSelector<VideoTrack[]>(state => state.videoTracks.byStageDevice[state.globals.localStageDeviceId]?.map(id => state.videoTracks.byId[id]) || [])
  const reportError = useErrorReporting()

  React.useEffect(() => {
    if (state && reportError && videoTracks.length > 0) {
      // Just use first video track (should be only one in webclient)
      const videoTrack = videoTracks[0]
      if (videoTrack.facingMode) {
        if (state.getConstraints().facingMode !== videoTrack.facingMode) {
          state.applyConstraints({
            facingMode: videoTrack.facingMode
          })
            .catch(err => reportError(err))
        }
      }
    }
  }, [state, reportError, videoTracks])

  React.useEffect(() => {
    if(state) {
      console.log("CONSTRAINTS")
      console.log(state.getConstraints())
      console.log(state.getCapabilities())
      console.log(state.getSettings())
    }
  }, [state])

  /*
  React.useEffect(() => {
    if (state) {
      const handler = () => {
        console.error("FIX ME")
        throw new Error("FIX ME")
      }
      state.addEventListener("ended", handler)
      return () => {
        state.removeEventListener("ended", handler)
      }
    }
  }, [state])*/

  return (
    <WebcamStateContext.Provider value={state}>
      <WebcamDispatchContext.Provider value={dispatch}>
        {children}
      </WebcamDispatchContext.Provider>
    </WebcamStateContext.Provider>
  )
}

const useWebcam = () => {
  const state = React.useContext(WebcamStateContext)
  if (state === null)
    throw new Error('Please wrap around your DOM tree with the WebcamProvider')
  return state
}

const useWebcamDispatch = () => {
  const state = React.useContext(WebcamDispatchContext)
  if (state === null)
    throw new Error('Please wrap around your DOM tree with the WebcamProvider')
  return state
}

export {WebcamProvider, useWebcam, useWebcamDispatch}
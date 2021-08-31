import {useAudioContext, useAudioContextDispatch, useStageSelector} from "@digitalstage/api-client-react";
import { logger } from "api/logger";
import React from "react";
import {startAudioContext} from "../provider/AudioContextProvider/utils";

const {trace, warn} = logger("AudioContextService")

const AudioContextService = () => {
  const {audioContext, player, running} = useAudioContext()
  const dispatch = useAudioContextDispatch()
  const sinkId = useStageSelector<string | undefined>((state) =>
    state.globals.localDeviceId
      ? (state.devices.byId[state.globals.localDeviceId].outputAudioDeviceId as never)
      : undefined
  )

  React.useEffect(() => {
    dispatch({type: 'start', dispatch})
  }, [])

  React.useEffect(() => {
    if (sinkId) {
      dispatch({type: 'setSinkId', sinkId})
    }
  }, [sinkId])

  /**
   * Try to start audio context with touch gesture on mobile devices
   */
  React.useEffect(() => {
    if (audioContext && player && !running) {
      trace('Adding touch handler to start audio context')
      const resume = () =>
        startAudioContext(audioContext, player)
          .then(() => trace('Started audio context via touch gesture'))
          .catch((err) => warn(err))

      document.body.addEventListener('touchstart', resume, false)
      document.body.addEventListener('touchend', resume, false)
      return () => {
        trace('Removed touch handler to start audio context')
        document.body.removeEventListener('touchstart', resume)
        document.body.removeEventListener('touchend', resume)
      }
    }
    return undefined
  }, [audioContext, player, running])

  return null
}
export {AudioContextService}
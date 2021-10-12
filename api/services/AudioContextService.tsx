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

import React from 'react'
import {BrowserDevice} from "@digitalstage/api-types";
import {logger} from '../logger'
import {useAudioContextDispatch,useAudioContext} from '../provider/AudioContextProvider'
import {startAudioContext} from '../provider/AudioContextProvider/utils'
import { RootState } from '../redux/RootState'
import { useTrackedSelector } from '../redux/selectors/useTrackedSelector'

const {trace, warn} = logger('AudioContextService')

const selectOutputAudioDeviceId = (state: RootState): string | undefined => state.globals.localDeviceId
  ? ((state.devices.byId[state.globals.localDeviceId] as BrowserDevice).outputAudioDeviceId)
  : undefined

const AudioContextService = () => {
  const {audioContext, player, running} = useAudioContext()
  const dispatch = useAudioContextDispatch()
  const state = useTrackedSelector()
  const sinkId = selectOutputAudioDeviceId(state)

  React.useEffect(() => {
    dispatch({type: 'start', dispatch})
  }, [dispatch])

  React.useEffect(() => {
    if (sinkId) {
      dispatch({type: 'setSinkId', sinkId})
    }
  }, [dispatch, sinkId])

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

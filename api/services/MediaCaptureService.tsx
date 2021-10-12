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
import {BrowserDevice, WebMediaDevice} from '@digitalstage/api-types/dist/model/browser'
import {getVideoTrack} from "../utils/getVideoTrack";
import {useWebcamDispatch} from "../provider/WebcamProvider";
import {useMicrophoneDispatch} from "../provider/MicrophoneProvider";
import {useEmit} from './ConnectionService';
import {getAudioTrack} from "../utils/getAudioTrack";
import {logger} from '../logger';
import {useErrorReporting, useTrackedSelector} from "@digitalstage/api-client-react";
import {refreshMediaDevices as refreshMediaDevicesSync} from 'api/utils/refreshMediaDevices';

const {trace} = logger("MediaCaptureService")

const MediaCaptureService = () => {
  const emit = useEmit()
  const dispatchWebcam = useWebcamDispatch()
  const dispatchMicrophone = useMicrophoneDispatch()
  const reportError = useErrorReporting()

  const state = useTrackedSelector()

  const ready = state.globals.ready
  const localDeviceId = state.globals.localDeviceId
  const sendVideo = state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].sendVideo : false
  const sendAudio = state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].sendAudio : false
  const inputVideoDeviceId = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputVideoDeviceId : undefined
  const inputAudioDeviceId = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputAudioDeviceId : undefined
  const autoGainControl = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).autoGainControl : false
  const echoCancellation = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).echoCancellation : false
  const noiseSuppression = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).noiseSuppression : false
  const sampleRate = state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).sampleRate : undefined
  const inputAudioDevices = React.useMemo(() => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputAudioDevices : [], [state.devices.byId, state.globals.localDeviceId])
  const inputVideoDevices = React.useMemo(() => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputVideoDevices : [], [state.devices.byId, state.globals.localDeviceId])
  const outputAudioDevices =  React.useMemo(() => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).outputAudioDevices : [], [state.devices.byId, state.globals.localDeviceId])
  const lastInputAudioDevices = React.useRef<WebMediaDevice[]>([])
  const lastInputVideoDevices = React.useRef<WebMediaDevice[]>([])
  const lastOutputAudioDevices = React.useRef<WebMediaDevice[]>([])

  /* Sync current state with reference (to avoid async callbacks when enumerating devices later) */
  React.useEffect(() => {
    lastInputAudioDevices.current = inputAudioDevices
  }, [inputAudioDevices])
  React.useEffect(() => {
    lastInputVideoDevices.current = inputVideoDevices
  }, [inputVideoDevices])
  React.useEffect(() => {
    lastOutputAudioDevices.current = outputAudioDevices
  }, [outputAudioDevices])

  const refreshMediaDevices = React.useCallback(() => {
    if (emit && localDeviceId && reportError) {
      return refreshMediaDevicesSync(
        localDeviceId,
        lastInputAudioDevices.current,
        lastInputVideoDevices.current,
        lastOutputAudioDevices.current,
        emit
      )
        .catch(err => reportError("Could not access media devices, reason: " + err))
    }
    return undefined
  }, [emit, localDeviceId, reportError])

  React.useEffect(() => {
    if (ready && dispatchWebcam && sendVideo && refreshMediaDevices) {
      trace("Fetching webcam")
      let abort = false
      let track: MediaStreamTrack
      getVideoTrack(inputVideoDeviceId)
        .then(capturedTrack => {
          if (abort) {
            if (capturedTrack)
              capturedTrack.stop()
            throw new Error("Aborted by user")
          } else {
            if (capturedTrack) {
              track = capturedTrack
              dispatchWebcam(track)
            } else {
              throw new Error("User denied access to webcam")
            }
          }
        })
        .then(() => refreshMediaDevices())
        .catch(err => {
          reportError(err)
        })
      return () => {
        trace("Stopped fetching webcam")
        abort = true
        if (track) {
          track.stop()
        }
        dispatchWebcam(undefined)
      }
    }
  }, [dispatchWebcam, inputVideoDeviceId, ready, sendVideo, refreshMediaDevices, reportError])

  React.useEffect(() => {
    if (ready && reportError && dispatchMicrophone && sendAudio && refreshMediaDevices) {
      trace("Fetching microphone")
      let abort = false
      let track: MediaStreamTrack
      getAudioTrack({
        deviceId: inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
      }).then((capturedTrack) => {
        if (abort) {
          if (capturedTrack)
            capturedTrack.stop()
        } else {
          if (capturedTrack) {
            track = capturedTrack
            dispatchMicrophone(track)
          } else {
            throw new Error("User denied access to microphone")
          }
        }
      })
        .then(() => refreshMediaDevices())
        .catch(err => {
          reportError(err)
        })
      return () => {
        trace("Stopped fetching microphone")
        abort = true
        if (track) {
          track.stop()
        }
        dispatchMicrophone(undefined)
      }
    }
  }, [autoGainControl, dispatchMicrophone, echoCancellation, inputAudioDeviceId, noiseSuppression, ready, sampleRate, sendAudio, refreshMediaDevices, reportError])


  React.useEffect(() => {
    if (refreshMediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", refreshMediaDevices)
      return () => {
        navigator.mediaDevices.removeEventListener("devicechange", refreshMediaDevices)
      }
    }
  }, [refreshMediaDevices])

  return null
}
export {MediaCaptureService}

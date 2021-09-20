import React from 'react'
import {BrowserDevice, WebMediaDevice} from '@digitalstage/api-types/dist/model/browser'
import {getVideoTrack} from "../utils/getVideoTrack";
import {useWebcamDispatch} from "../provider/WebcamProvider";
import {useMicrophoneDispatch} from "../provider/MicrophoneProvider";
import {useStageSelector} from '../redux/selectors/useStageSelector';
import {useEmit} from './ConnectionService';
import {getAudioTrack} from "../utils/getAudioTrack";
import {useReady} from '../hooks/useReady';
import {logger} from '../logger';
import {useErrorReporting} from "@digitalstage/api-client-react";
import {refreshMediaDevices as refreshMediaDevicesSync} from 'api/utils/refreshMediaDevices';

const {trace} = logger("MediaCaptureService")

const MediaCaptureService = () => {
  const ready = useReady()
  const emit = useEmit()
  const dispatchWebcam = useWebcamDispatch()
  const dispatchMicrophone = useMicrophoneDispatch()
  const reportError = useErrorReporting()

  const localDeviceId = useStageSelector(state => state.globals.localDeviceId)
  const sendVideo = useStageSelector(state => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].sendVideo : false)
  const sendAudio = useStageSelector(state => state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].sendAudio : false)
  const inputVideoDeviceId = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputVideoDeviceId : undefined)
  const inputAudioDeviceId = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputAudioDeviceId : undefined)
  const autoGainControl = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).autoGainControl : false)
  const echoCancellation = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).echoCancellation : false)
  const noiseSuppression = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).noiseSuppression : false)
  const sampleRate = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).sampleRate : undefined)
  const inputAudioDevices = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputAudioDevices : [])
  const inputVideoDevices = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).inputVideoDevices : [])
  const outputAudioDevices = useStageSelector(state => state.globals.localDeviceId ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice).outputAudioDevices : [])
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
    if (emit && localDeviceId) {
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
  }, [emit, localDeviceId])

  React.useEffect(() => {
    if (ready && dispatchWebcam && sendVideo && refreshMediaDevices) {
      trace("Fetching webcam")
      let abort = false
      let track
      getVideoTrack(inputVideoDeviceId)
        .then(capturedTrack => {
          if (abort) {
            capturedTrack.stop()
          } else {
            track = capturedTrack
            dispatchWebcam(track)
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
  }, [dispatchWebcam, inputVideoDeviceId, ready, sendVideo, refreshMediaDevices])

  React.useEffect(() => {
    if (ready && reportError && dispatchMicrophone && sendAudio && refreshMediaDevices) {
      trace("Fetching microphone")
      let abort = false
      let track
      getAudioTrack({
        deviceId: inputAudioDeviceId,
        autoGainControl,
        echoCancellation,
        noiseSuppression,
        sampleRate,
      }).then((capturedTrack) => {
        if (abort) {
          capturedTrack.stop()
        } else {
          track = capturedTrack
          dispatchMicrophone(track)
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
  }, [autoGainControl, dispatchMicrophone, echoCancellation, inputAudioDeviceId, noiseSuppression, ready, sampleRate, sendAudio, refreshMediaDevices])


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

import React from 'react'
import {BrowserDevice} from '@digitalstage/api-types/dist/model/browser'
import {getVideoTrack} from "../utils/getVideoTrack";
import {useWebcamDispatch} from "../provider/WebcamProvider";
import {useMicrophoneDispatch} from "../provider/MicrophoneProvider";
import {useStageSelector} from '../redux/selectors/useStageSelector';
import {useEmit} from './ConnectionService';
import {getAudioTrack} from "../utils/getAudioTrack";
import { useReady } from '../hooks/useReady';
import { logger } from '../logger';
import { refreshMediaDevices } from '../utils/refreshMediaDevices';

const {trace} = logger("MediaCaptureService")

const MediaCaptureService = () => {
    const ready = useReady()
    const emit = useEmit()
    const dispatchWebcam = useWebcamDispatch()
    const dispatchMicrophone = useMicrophoneDispatch()

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

    React.useEffect(() => {
        if (ready && dispatchWebcam && sendVideo) {
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
            return () => {
                trace("Stopped fetching webcam")
                abort = true
                if(track) {
                    track.stop()
                }
                dispatchWebcam(undefined)
            }
        }
    }, [dispatchWebcam, inputVideoDeviceId, ready, sendVideo])

    React.useEffect(() => {
        if (ready && dispatchMicrophone && sendAudio) {
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
            return () => {
                trace("Stopped fetching microphone")
                abort = true
                if(track) {
                    track.stop()
                }
                dispatchMicrophone(undefined)
            }
        }
    }, [autoGainControl, dispatchMicrophone, echoCancellation, inputAudioDeviceId, noiseSuppression, ready, sampleRate, sendAudio])

    React.useEffect(() => {
        if (ready && emit && localDeviceId) {
            trace("Refreshing media devices list")
            navigator.mediaDevices.ondevicechange = () =>
                refreshMediaDevices(
                    localDeviceId,
                    inputAudioDevices,
                    inputVideoDevices,
                    outputAudioDevices,
                    emit
                )
            return () => {
                navigator.mediaDevices.ondevicechange = undefined
            }
        }
    }, [emit, inputAudioDevices, inputVideoDevices, localDeviceId, outputAudioDevices, ready])

    return null
}
export {MediaCaptureService}

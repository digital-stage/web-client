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

import {
  selectAudioTrackById,
  selectLocalStageDeviceId, selectStageDeviceIdsByCurrentStage,
  useAudioContext,
  useRemoteAudioTracks,
  useTrackedSelector
} from "../..";
import React from "react";
import {useLocalAudioTracks} from "../../hooks/useLocalAudioTracks";

const AudioTrackRenderer = ({audioTrackId, track}: { audioTrackId: string, track: MediaStreamTrack }) => {
  const state = useTrackedSelector()
  const audioTrack = selectAudioTrackById(state, audioTrackId)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const {audioContext} = useAudioContext()
  // const dispatchAudioNode = useAudioNodeDispatch()
  const [sourceNode, setSourceNode] = React.useState<AudioNode>()
  const gainNode = React.useMemo<GainNode | undefined>(
    () => audioContext && audioContext.createGain(),
    [audioContext]
  )
  const customMuted = state.globals.localDeviceId &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
    ? state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
      ].muted
    : undefined
  const customVolume = state.globals.localDeviceId &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
    ? state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
      ].volume
    : undefined

  React.useEffect(() => {
    if (audioContext && audioRef.current) {
      const stream = new MediaStream([track])
      const source = audioContext.createMediaStreamSource(stream)
      setSourceNode(source)
      const audioElement = audioRef.current
      audioElement.srcObject = stream
      audioElement.muted = true
      return () => {
        setSourceNode(undefined)
        audioElement.srcObject = null
      }
    }
  }, [audioContext, track])

  React.useEffect(() => {
    if (sourceNode && gainNode && audioContext?.destination) {
      sourceNode.connect(gainNode)
      gainNode.connect(audioContext.destination)
      return () => {
        gainNode.disconnect(audioContext.destination)
        sourceNode.disconnect(gainNode)
      }
    }
  }, [sourceNode, gainNode, audioContext?.destination])


  React.useEffect(() => {
    if (audioContext && gainNode) {
      if (customMuted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else if (customVolume) {
        gainNode.gain.setValueAtTime(customVolume, audioContext.currentTime)
      } else if (audioTrack?.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(audioTrack?.volume || 0, audioContext.currentTime)
      }
    }
  }, [
    audioContext,
    gainNode,
    audioTrack?.volume,
    audioTrack?.muted,
    customVolume,
    customMuted,
  ])

  return (
    <audio ref={audioRef}/>
  )
}

const LocalStageDeviceRenderer = () => {
  const localAudioTracks = useLocalAudioTracks()
  return (
    <>
      {Object.keys(localAudioTracks).map(audioTrackId => <AudioTrackRenderer key={audioTrackId}
                                                                             audioTrackId={audioTrackId}
                                                                             track={localAudioTracks[audioTrackId]}/>)}
    </>
  )
}

const RemoteStageDeviceRenderer = ({stageDeviceId}: { stageDeviceId: string }) => {
  // const {audioContext} = useAudioContext()
  // const analyserNode = React.useMemo<AnalyserNode | undefined>(() => audioContext && audioContext.createAnalyser(), [audioContext])
  const remoteAudioTracks = useRemoteAudioTracks(stageDeviceId)

  return (
    <>
      {Object.keys(remoteAudioTracks).map(audioTrackId => <AudioTrackRenderer key={audioTrackId}
                                                                              audioTrackId={audioTrackId}
                                                                              track={remoteAudioTracks[audioTrackId]}/>)}
    </>
  )
}

const AudioRenderService = (): JSX.Element => {
  const state = useTrackedSelector()
  const localStageDeviceId = selectLocalStageDeviceId(state)
  const stageDeviceIds = selectStageDeviceIdsByCurrentStage(state)
  return (
    <>
      {stageDeviceIds.map(stageDeviceId => {
        if (stageDeviceId === localStageDeviceId) {
          return (<LocalStageDeviceRenderer key={stageDeviceId}/>)
        }
        return (<RemoteStageDeviceRenderer key={stageDeviceId} stageDeviceId={stageDeviceId}/>)
      })}
    </>
  )
}
export {AudioRenderService}
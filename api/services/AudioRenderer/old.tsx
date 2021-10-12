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

import React, {useEffect, useMemo, useRef, useState} from 'react'
import {
  CustomAudioTrackVolume,
  CustomGroupVolume,
  CustomStageDeviceVolume,
  CustomStageMemberVolume,
  Group,
  StageDevice,
  StageMember,
} from '@digitalstage/api-types'

import {useStageDevicePosition} from './useStageDevicePosition'
import {useAudioTrackPosition} from './useAudioTrackPosition'
import {useAudioContext} from '../../provider/AudioContextProvider'
import {useAudioLevelDispatch} from '../../provider/AudioLevelProvider'
import {shallowEqual} from 'react-redux'
import {useStageSelector} from '../../redux/selectors/useStageSelector'
import {logger} from '../../logger'
import {useRemoteAudioTracks} from "../../hooks/useRemoteAudioTracks";
import {useLocalAudioTracks} from "../../hooks/useLocalAudioTracks";
import {useAnimationFrame} from "../../../lib/useAnimationFrame";
import {selectRender3DAudio, useTrackedSelector} from "@digitalstage/api-client-react";

const {trace} = logger('AudioRendererService')

const yRotationToVector = (degrees: number): [number, number, number] => {
  // convert degrees to radians and offset the angle so 0 points towards the listener
  const radians = (degrees - 90) * (Math.PI / 180)
  // using cosine and sine here ensures the output values are always normalized
  // i.e. they range between -1 and 1
  const x = Math.cos(radians)
  const z = Math.sin(radians)

  // we hard-code the Y component to 0, as Y is the axis of rotation
  return [x, 0, z]
}

const useLevelPublishing = (
  id: string,
  audioContext: AudioContext,
  audioNode?: AudioNode,
  enabled?: boolean
) => {
  const dispatch = useAudioLevelDispatch()
  const analyserNode = useMemo<AnalyserNode>(() => {
    const analyser = audioContext.createAnalyser()
    analyser.minDecibels = -100
    analyser.maxDecibels = 12
    analyser.fftSize = 32
    return analyser
  }, [audioContext])
  const array = useMemo<Uint8Array>(
    () => new Uint8Array(analyserNode.frequencyBinCount),
    [analyserNode]
  )
  useEffect(() => {
    if (id && dispatch && array && enabled) {
      trace('Registering level for ' + id)
      dispatch({type: 'add', id: id, level: array.buffer})
      return () => {
        dispatch({type: 'remove', id: id})
      }
    }
  }, [id, array, enabled, dispatch])
  useEffect(() => {
    if (audioNode && analyserNode) {
      audioNode.connect(analyserNode)
      return () => {
        audioNode.disconnect(analyserNode)
      }
    }
    return undefined
  }, [audioNode, analyserNode])
  useAnimationFrame(() => {
    if (analyserNode && array) {
      analyserNode.getByteFrequencyData(array)
    }
  }, [analyserNode, array])
  return undefined
}

const AudioTrackRenderer = ({
                              audioTrackId,
                              track,
                              audioContext,
                              destination,
                              deviceId,
                            }: {
  audioTrackId: string,
  track: MediaStreamTrack
  audioContext: AudioContext
  destination: AudioNode
  deviceId: string
}): JSX.Element => {
  const state = useTrackedSelector()
  const audioTrack = useStageSelector(state => state.audioTracks.byId[audioTrackId])
  const renderSpatialAudio = selectRender3DAudio(state)
  const customVolume = useStageSelector<CustomAudioTrackVolume | undefined>(
    (state) =>
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
        ? state.customAudioTrackVolumes.byId[
          state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
          ]
        : undefined,
    shallowEqual
  )

  const audioRef = useRef<HTMLAudioElement>(null)
  const [sourceNode, setSourceNode] = useState<MediaStreamAudioSourceNode>()
  const pannerNode = useMemo<PannerNode | undefined>(() => {
    if (renderSpatialAudio) {
      trace('Creating 3D audio panner')
      const node = audioContext.createPanner()
      node.panningModel = 'HRTF'
      node.distanceModel = 'linear'
      node.maxDistance = 10000
      node.refDistance = 1
      node.rolloffFactor = 5
      node.coneInnerAngle = 45
      node.coneOuterAngle = 90
      node.coneOuterGain = 0.3
      return node
    }
    return undefined
  }, [audioContext, renderSpatialAudio])
  const gainNode = useMemo<GainNode>(
    () => audioContext.createGain(),
    [audioContext]
  )
  const position = useAudioTrackPosition({audioTrack, deviceId})

  useEffect(() => {
    if (audioContext && track && audioRef.current) {
      const stream = new MediaStream([track])
      const audioElement = audioRef.current
      audioElement.srcObject = stream
      audioElement.muted = true
      const source = audioContext.createMediaStreamSource(stream)
      setSourceNode(source)
      return () => {
        audioElement.srcObject = null
      }
    }
  }, [track, audioContext])

  useEffect(() => {
    if (sourceNode && gainNode && destination) {
      if (pannerNode) {
        sourceNode.connect(pannerNode)
        pannerNode.connect(gainNode)
        gainNode.connect(destination)
        return () => {
          gainNode.disconnect(destination)
          pannerNode.disconnect(gainNode)
          sourceNode.disconnect(pannerNode)
        }
      } else {
        sourceNode.connect(gainNode)
        gainNode.connect(destination)
        return () => {
          gainNode.disconnect(destination)
          sourceNode.disconnect(gainNode)
        }
      }
    }
    return undefined
  }, [sourceNode, pannerNode, gainNode, destination])

  useEffect(() => {
    if (audioContext && gainNode) {
      if (customVolume?.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else if (customVolume?.volume) {
        gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
      } else if (audioTrack.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(audioTrack.volume, audioContext.currentTime)
      }
    }
  }, [
    audioContext,
    gainNode,
    audioTrack.volume,
    audioTrack.muted,
    customVolume?.volume,
    customVolume?.muted,
  ])

  useEffect(() => {
    if (audioContext && pannerNode) {
      /**
       * WebAudio API is using x, z for the horizontal and y for the vertical position,
       * so we have to assign:
       * x = x
       * y = z
       * z = y
       */
      pannerNode.positionX.setValueAtTime(position.x, audioContext.currentTime)
      pannerNode.positionY.setValueAtTime(position.z, audioContext.currentTime)
      pannerNode.positionZ.setValueAtTime(position.y, audioContext.currentTime)
      const orientation = yRotationToVector(position.rZ)
      pannerNode.orientationX.setValueAtTime(orientation[0], audioContext.currentTime)
      pannerNode.orientationY.setValueAtTime(orientation[1], audioContext.currentTime)
      pannerNode.orientationZ.setValueAtTime(orientation[2], audioContext.currentTime)

      if (position.directivity === 'cardoid') {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 60
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterAngle = 120
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterGain = 0.3
      } else {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 360
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterAngle = 360
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterGain = 0
      }
    }
  }, [audioContext, pannerNode, position])

  useLevelPublishing(audioTrack._id, audioContext, pannerNode || sourceNode, true)

  return (
    <audio ref={audioRef}/>
  )
}

const useStageDeviceAudioTracks = (stageDeviceId: string):
  { [audioTrackId: string]: MediaStreamTrack } => {
  const localStageDeviceId = useStageSelector(state => state.globals.localStageDeviceId)
  const localAudioTracks = useLocalAudioTracks()
  const remoteAudioTracks = useRemoteAudioTracks(stageDeviceId)
  return React.useMemo<{ [audioTrackId: string]: MediaStreamTrack }>(() => {
    if (localStageDeviceId === stageDeviceId) {
      return localAudioTracks
    }
    return remoteAudioTracks
  }, [localAudioTracks, localStageDeviceId, remoteAudioTracks, stageDeviceId])
}

const StageDeviceRenderer = ({
                               stageDeviceId,
                               audioContext,
                               destination,
                               deviceId,
                             }: {
  stageDeviceId: string
  audioContext: AudioContext
  destination: AudioNode
  deviceId: string
}): JSX.Element => {
  const stageDevice = useStageSelector<StageDevice>(
    (state) => state.stageDevices.byId[stageDeviceId],
    shallowEqual
  )
  const customVolume = useStageSelector<CustomStageDeviceVolume | undefined>(
    (state) =>
      state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
      state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
        ? state.customStageDeviceVolumes.byId[
          state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
          ]
        : undefined,
    shallowEqual
  )
  const audioTracks = useStageDeviceAudioTracks(stageDeviceId)
  const pannerNode = useMemo<PannerNode>(() => {
    const node = audioContext.createPanner()
    node.panningModel = 'HRTF'
    node.distanceModel = 'exponential'
    node.maxDistance = 10000
    node.refDistance = 1
    node.rolloffFactor = 20
    return node
  }, [audioContext])
  const gainNode = useMemo<GainNode>(
    () => audioContext.createGain(),
    [audioContext]
  )
  const position = useStageDevicePosition({stageDeviceId, deviceId})

  useEffect(() => {
    if (pannerNode && gainNode) {
      pannerNode.connect(gainNode)
      return () => {
        pannerNode.disconnect(gainNode)
      }
    }
    return undefined
  }, [pannerNode, gainNode])

  useEffect(() => {
    if (gainNode && destination) {
      gainNode.connect(destination)
      return () => {
        gainNode.disconnect(destination)
      }
    }
    return undefined
  }, [gainNode, destination])

  useEffect(() => {
    if (audioContext && gainNode) {
      if (customVolume?.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else if (customVolume?.volume) {
        gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
      } else if (stageDevice.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(stageDevice.volume, audioContext.currentTime)
      }
    }
  }, [
    audioContext,
    gainNode,
    stageDevice.volume,
    stageDevice.muted,
    customVolume?.volume,
    customVolume?.muted,
  ])

  useEffect(() => {
    if (audioContext && pannerNode) {
      pannerNode.positionX.setValueAtTime(position.x, audioContext.currentTime)
      pannerNode.positionY.setValueAtTime(position.y, audioContext.currentTime)
      pannerNode.positionZ.setValueAtTime(position.z, audioContext.currentTime)
      const orientation = yRotationToVector(position.rZ)
      pannerNode.orientationX.setValueAtTime(orientation[0], audioContext.currentTime)
      pannerNode.orientationY.setValueAtTime(orientation[1], audioContext.currentTime)
      pannerNode.orientationZ.setValueAtTime(orientation[2], audioContext.currentTime)
      if (position.directivity === 'cardoid') {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 90
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterAngle = 360
        pannerNode.coneOuterGain = 0.3
      } else {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 30
        // pannerNode.coneOuterAngle = 90
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterGain = 0.3
      }
    }
  }, [audioContext, pannerNode, position])

  useLevelPublishing(stageDeviceId, audioContext, gainNode, Object.keys(audioTracks).length > 0)

  return (
    <>
      {Object.keys(audioTracks).map((audioTrackId) => {
        return (
          <AudioTrackRenderer
            key={audioTrackId}
            audioTrackId={audioTrackId}
            track={audioTracks[audioTrackId]}
            audioContext={audioContext}
            destination={gainNode}
            deviceId={deviceId}
          />
        )
      })}
    </>
  )
}
const StageMemberRenderer = ({
                               stageMemberId,
                               audioContext,
                               destination,
                               deviceId,
                             }: {
  stageMemberId: string
  audioContext: AudioContext
  destination: AudioNode
  deviceId: string
}): JSX.Element => {
  const stageDeviceIds = useStageSelector(
    (state) => state.stageDevices.byStageMember[stageMemberId] || []
  )
  const stageMember = useStageSelector<StageMember>(
    (state) => state.stageMembers.byId[stageMemberId],
    shallowEqual
  )
  const customVolume = useStageSelector<CustomStageMemberVolume | undefined>(
    (state) =>
      state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
      state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
        ? state.customStageMemberVolumes.byId[
          state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
          ]
        : undefined,
    shallowEqual
  )
  const gainNode = useMemo<GainNode>(
    () => audioContext.createGain(),
    [audioContext]
  )

  useEffect(() => {
    if (destination && gainNode) {
      gainNode.connect(destination)
      return () => {
        gainNode.disconnect(destination)
      }
    }
    return undefined
  }, [gainNode, destination])

  useEffect(() => {
    if (audioContext && gainNode) {
      if (customVolume?.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else if (customVolume?.volume) {
        gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
      } else if (stageMember.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(stageMember.volume, audioContext.currentTime)
      }
    }
  }, [
    audioContext,
    gainNode,
    stageMember.volume,
    stageMember.muted,
    customVolume?.volume,
    customVolume?.muted,
  ])

  const hasAudioTracks = useStageSelector((state) =>
    state.audioTracks.byStageMember[stageMemberId]
      ? state.audioTracks.byStageMember[stageMemberId].length > 0
      : false
  )
  useLevelPublishing(stageMemberId, audioContext, gainNode, hasAudioTracks)

  return (
    <>
      {stageDeviceIds.map((stageDeviceId) => (
        <StageDeviceRenderer
          key={stageDeviceId}
          stageDeviceId={stageDeviceId}
          audioContext={audioContext}
          destination={gainNode}
          deviceId={deviceId}
        />
      ))}
    </>
  )
}
const GroupRenderer = ({
                         groupId,
                         audioContext,
                         destination,
                         deviceId,
                       }: {
  groupId: string
  audioContext: AudioContext
  destination: AudioNode
  deviceId: string
}): JSX.Element => {
  const stageMemberIds = useStageSelector((state) => state.stageMembers.byGroup[groupId] || [])
  const group = useStageSelector<Group>((state) => state.groups.byId[groupId], shallowEqual)
  const customVolume = useStageSelector<CustomGroupVolume | undefined>(
    (state) =>
      state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
      state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
        ? state.customGroupVolumes.byId[
          state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
          ]
        : undefined,
    shallowEqual
  )
  const gainNode = useMemo<GainNode>(
    () => audioContext.createGain(),
    [audioContext]
  )

  useEffect(() => {
    if (destination && gainNode) {
      gainNode.connect(destination)
      return () => {
        gainNode.disconnect(destination)
      }
    }
    return undefined
  }, [gainNode, destination])

  useEffect(() => {
    if (audioContext && gainNode) {
      if (customVolume?.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else if (customVolume?.volume) {
        gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
      } else if (group.muted) {
        gainNode.gain.setValueAtTime(0, audioContext.currentTime)
      } else {
        gainNode.gain.setValueAtTime(group.volume, audioContext.currentTime)
      }
    }
  }, [
    audioContext,
    gainNode,
    group.volume,
    group.muted,
    customVolume?.volume,
    customVolume?.muted,
  ])

  useLevelPublishing(groupId, audioContext, gainNode, stageMemberIds.length > 0)

  return (
    <>
      {stageMemberIds.map((stageMemberId) => (
        <StageMemberRenderer
          key={stageMemberId}
          stageMemberId={stageMemberId}
          audioContext={audioContext}
          destination={gainNode}
          deviceId={deviceId}
        />
      ))}
    </>
  )
}

const ListenerRenderer = ({
                            audioContext,
                            stageDeviceId,
                            deviceId,
                          }: {
  audioContext: AudioContext
  stageDeviceId: string
  deviceId: string
}): JSX.Element | null => {
  const position = useStageDevicePosition({stageDeviceId, deviceId})

  useEffect(() => {
    const orientation = yRotationToVector(position.rZ)
    if(!audioContext.listener.positionX) {
      // Fallback for firefox
      audioContext.listener.setOrientation(
        position.x,
        position.z,
        position.y,
        orientation[0],
        orientation[1],
        orientation[2],
      )
    } else {
      audioContext.listener.positionX.setValueAtTime(position.x, audioContext.currentTime)
      audioContext.listener.positionY.setValueAtTime(position.z, audioContext.currentTime)
      audioContext.listener.positionZ.setValueAtTime(position.y, audioContext.currentTime)
      audioContext.listener.forwardX.setValueAtTime(orientation[0], audioContext.currentTime)
      audioContext.listener.forwardY.setValueAtTime(orientation[1], audioContext.currentTime)
      audioContext.listener.forwardZ.setValueAtTime(orientation[2], audioContext.currentTime)
    }
  }, [audioContext, position])

  return null
}

const StageRenderer = ({
                         stageId,
                         audioContext,
                         deviceId,
                         useReverb,
                       }: {
  stageId: string
  audioContext: AudioContext
  deviceId: string
  useReverb: boolean
}): JSX.Element => {
  const groupIds = useStageSelector((state) => state.groups.byStage[stageId] || [])
  const localStageDeviceId = useStageSelector<string | undefined>(
    (state) => state.globals.localStageDeviceId
  )
  const [convolverNode, setConvolverNode] = useState<ConvolverNode | undefined>()

  useEffect(() => {
    if (useReverb) {
      fetch('/static/media/SpokaneWomansClub.mp4')
        .then((response) => response.arrayBuffer())
        .then((buffer) => audioContext.decodeAudioData(buffer))
        .then((audioBuffer) => {
          const node = audioContext.createConvolver()
          node.buffer = audioBuffer
          return setConvolverNode(node)
        })
        .catch((err) => console.error(err))
    } else {
      setConvolverNode(undefined)
    }
  }, [audioContext, useReverb])

  useEffect(() => {
    if (convolverNode && audioContext.destination) {
      convolverNode.connect(audioContext.destination)
      return () => convolverNode.disconnect(audioContext.destination)
    }
    return undefined
  }, [convolverNode, audioContext.destination])

  return (
    <>
      {localStageDeviceId && (
        <ListenerRenderer
          audioContext={audioContext}
          stageDeviceId={localStageDeviceId}
          deviceId={deviceId}
        />
      )}
      {groupIds.map((groupId) => (
        <GroupRenderer
          key={groupId}
          groupId={groupId}
          audioContext={audioContext}
          destination={convolverNode || audioContext.destination}
          deviceId={deviceId}
        />
      ))}
    </>
  )
}

const AudioRenderService = () => {
  const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
  const {audioContext} = useAudioContext()
  const localDeviceId = useStageSelector<string | undefined>(
    (state) => state.globals.localDeviceId
  )

  useEffect(() => {
    trace("AudioRendering Engine started")
    return () => {
      trace("AudioRendering Engine stopped")
    }
  }, [])

  if (stageId && localDeviceId && audioContext) {
    return (
      <StageRenderer
        stageId={stageId}
        audioContext={audioContext}
        deviceId={localDeviceId}
        useReverb={false}
      />
    )
  }
  return null
}

export {AudioRenderService}

import React, {useEffect, useMemo, useRef, useState} from 'react'
import {
  IAnalyserNode,
  IAudioContext,
  IAudioNode,
  IConvolverNode,
  IGainNode,
  IMediaStreamAudioSourceNode,
  IPannerNode,
} from 'standardized-audio-context'
import {
  AudioTrack,
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
import useAnimationFrame from 'use-animation-frame'
import {useAudioContext} from '../../provider/AudioContextProvider'
import {useAudioLevelDispatch} from '../../provider/AudioLevelProvider'
import {shallowEqual} from 'react-redux'
import {useStageSelector} from '../../redux/selectors/useStageSelector'
import {useWebRTCLocalAudioTrack, useWebRTCRemoteAudioTrackByStageDevice} from '../WebRTCService'
import {logger} from '../../logger'
import {useAudioConsumer, useAudioProducer} from '../MediasoupService'
import {useSpatialAudioSelector} from '../../redux/selectors/useSpatialAudioSelector'

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
  audioContext: IAudioContext,
  audioNode?: IAudioNode<IAudioContext>,
  enabled?: boolean
) => {
  const dispatch = useAudioLevelDispatch()
  const analyserNode = useMemo<IAnalyserNode<IAudioContext>>(() => {
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
                              audioTrack,
                              audioContext,
                              destination,
                              deviceId,
                            }: {
  audioTrack: AudioTrack
  audioContext: IAudioContext
  destination: IAudioNode<IAudioContext>
  deviceId: string
}): JSX.Element => {
  const renderSpatialAudio = useSpatialAudioSelector()
  const customVolume = useStageSelector<CustomAudioTrackVolume | undefined>(
    (state) =>
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrack._id]
        ? state.customAudioTrackVolumes.byId[
          state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrack._id]
          ]
        : undefined,
    shallowEqual
  )
  const localStageDeviceId = useStageSelector((state) => state.globals.localStageDeviceId)
  const mediasoupAudioConsumer = useAudioConsumer(audioTrack._id)
  const mediasoupAudioProducer = useAudioProducer()
  const localWebRTCTrack = useWebRTCLocalAudioTrack()
  const remoteWebRTCTrack = useWebRTCRemoteAudioTrackByStageDevice(audioTrack.stageDeviceId)
  const audioRef = useRef<HTMLAudioElement>(null)
  const [track, setTrack] = useState<MediaStreamTrack>()
  const [sourceNode, setSourceNode] = useState<IMediaStreamAudioSourceNode<IAudioContext>>()
  const pannerNode = useMemo<IPannerNode<IAudioContext> | undefined>(() => {
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
  const gainNode = useMemo<IGainNode<IAudioContext>>(
    () => audioContext.createGain(),
    [audioContext]
  )
  const position = useAudioTrackPosition({audioTrack, deviceId})


  useEffect(() => {
    trace("localWebRTCTrack")
  }, [localWebRTCTrack])

  useEffect(() => {
    trace("mediasoupAudioProducer")
  }, [mediasoupAudioProducer])

  useEffect(() => {
    trace("mediasoupAudioConsumer")
  }, [mediasoupAudioConsumer])

  useEffect(() => {
    trace("remoteWebRTCTrack")
  }, [remoteWebRTCTrack])

  useEffect(() => {
    trace("localStageDeviceId")
  }, [localStageDeviceId])

  useEffect(() => {
    trace("audioTrack.stageDeviceId")
  }, [audioTrack.stageDeviceId])

  useEffect(() => {
    setTrack((prev) => {
      trace("Did not have a track before")
      // Prefer local tracks
      if (localStageDeviceId === audioTrack.stageDeviceId) {
        if (mediasoupAudioProducer) return mediasoupAudioProducer.track
        if (localWebRTCTrack) return localWebRTCTrack
      }
      trace(mediasoupAudioConsumer)
      trace(remoteWebRTCTrack)
      if (mediasoupAudioConsumer) return mediasoupAudioConsumer.track
      if (remoteWebRTCTrack) return remoteWebRTCTrack
    })
  }, [
    localStageDeviceId,
    audioTrack.stageDeviceId,
    mediasoupAudioConsumer,
    remoteWebRTCTrack,
    mediasoupAudioProducer,
    localWebRTCTrack,
  ])

  useEffect(() => {
    console.log("TRACK CHANGED")
  }, [track])

  useEffect(() => {
    if (audioRef.current && audioContext && track) {
      const stream = new MediaStream([track])
      audioRef.current.srcObject = stream
      audioRef.current.autoplay = true
      audioRef.current.muted = true
      audioRef.current.play().catch((err) => console.error(err))
      const source = audioContext.createMediaStreamSource(stream)
      setSourceNode(source)
    }
  }, [audioRef, track, audioContext])

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
        pannerNode.coneOuterGain = 0.5
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
    <>
      <audio ref={audioRef}>
        <track kind="captions"/>
      </audio>
    </>
  )
}

const StageDeviceRenderer = ({
                               stageDeviceId,
                               audioContext,
                               destination,
                               deviceId,
                             }: {
  stageDeviceId: string
  audioContext: IAudioContext
  destination: IAudioNode<IAudioContext>
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
  const audioTracks = useStageSelector((state) =>
    state.audioTracks.byStageDevice[stageDeviceId]
      ? state.audioTracks.byStageDevice[stageDeviceId].map((id) => state.audioTracks.byId[id])
      : []
  )
  const pannerNode = useMemo<IPannerNode<IAudioContext>>(() => {
    const node = audioContext.createPanner()
    node.panningModel = 'HRTF'
    node.distanceModel = 'exponential'
    node.maxDistance = 10000
    node.refDistance = 1
    node.rolloffFactor = 20
    return node
  }, [audioContext])
  const gainNode = useMemo<IGainNode<IAudioContext>>(
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
      pannerNode.positionY.setValueAtTime(position.z, audioContext.currentTime)
      pannerNode.positionZ.setValueAtTime(position.y, audioContext.currentTime)
      const orientation = yRotationToVector(position.rZ)
      pannerNode.orientationX.setValueAtTime(orientation[0], audioContext.currentTime)
      pannerNode.orientationY.setValueAtTime(orientation[1], audioContext.currentTime)
      pannerNode.orientationZ.setValueAtTime(orientation[2], audioContext.currentTime)
      if (position.directivity === 'cardoid') {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 90
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterAngle = 360
      } else {
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneInnerAngle = 30
        // pannerNode.coneOuterAngle = 90
        // eslint-disable-next-line no-param-reassign
        pannerNode.coneOuterGain = 0.3
      }
    }
  }, [audioContext, pannerNode, position])

  useLevelPublishing(stageDeviceId, audioContext, gainNode, audioTracks.length > 0)

  return (
    <>
      {audioTracks.map((audioTrack) => (
        <AudioTrackRenderer
          key={audioTrack._id}
          audioTrack={audioTrack}
          audioContext={audioContext}
          destination={gainNode}
          deviceId={deviceId}
        />
      ))}
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
  audioContext: IAudioContext
  destination: IAudioNode<IAudioContext>
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
  const gainNode = useMemo<IGainNode<IAudioContext>>(
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
  audioContext: IAudioContext
  destination: IAudioNode<IAudioContext>
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
  const gainNode = useMemo<IGainNode<IAudioContext>>(
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
  audioContext: IAudioContext
  stageDeviceId: string
  deviceId: string
}): JSX.Element | null => {
  const position = useStageDevicePosition({stageDeviceId, deviceId})

  useEffect(() => {
    if (audioContext) {
      audioContext.listener.positionX.setValueAtTime(position.x, audioContext.currentTime)
      audioContext.listener.positionY.setValueAtTime(position.z, audioContext.currentTime)
      audioContext.listener.positionZ.setValueAtTime(position.y, audioContext.currentTime)
      const orientation = yRotationToVector(position.rZ)
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
                         destination,
                         deviceId,
                         useReverb,
                       }: {
  stageId: string
  audioContext: IAudioContext
  destination: IAudioNode<IAudioContext>
  deviceId: string
  useReverb: boolean
}): JSX.Element => {
  const groupIds = useStageSelector((state) => state.groups.byStage[stageId] || [])
  const localStageDeviceId = useStageSelector<string | undefined>(
    (state) => state.globals.localStageDeviceId
  )
  const [convolverNode, setConvolverNode] = useState<IConvolverNode<IAudioContext> | undefined>()

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
    if (convolverNode && destination) {
      convolverNode.connect(destination)
      return () => convolverNode.disconnect(destination)
    }
    return undefined
  }, [convolverNode, destination])

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
          destination={convolverNode || destination}
          deviceId={deviceId}
        />
      ))}
    </>
  )
}

const AudioRenderService = () => {
  const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
  const {audioContext, destination} = useAudioContext()
  const localDeviceId = useStageSelector<string | undefined>(
    (state) => state.globals.localDeviceId
  )

  useEffect(() => {
    trace("AudioRendering Engine started")
    return () => {
      trace("AudioRendering Engine stopped")
    }
  }, [])

  if (stageId && localDeviceId && audioContext && destination) {
    return (
      <StageRenderer
        stageId={stageId}
        audioContext={audioContext}
        destination={destination}
        deviceId={localDeviceId}
        useReverb={false}
      />
    )
  }
  return null
}

export {AudioRenderService}

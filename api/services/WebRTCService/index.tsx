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
import {
  ServerDeviceEvents
} from '@digitalstage/api-types'

import omit from 'lodash/omit'
import round from 'lodash/round'
import {
  selectCurrentAudioType,
  selectCurrentStageId,
  selectCurrentVideoType,
  selectP2PEnabled,
  selectReady
} from "api/redux/selectors";
import {useTrackedSelector} from 'api/redux/selectors/useTrackedSelector'
import {useConnection} from '../ConnectionService'
import {PeerConnection} from './PeerConnection'
import {logger} from '../../logger'
import {Broker} from './Broker'
import {useMicrophone} from "../../provider/MicrophoneProvider";
import {useErrorReporting} from '../../hooks/useErrorReporting'
import {useWebcam} from '../../provider/WebcamProvider'
import {publishTrack, unpublishTrack} from "../../utils/trackPublishing";

const {trace} = logger('WebRTCService')

type TrackMap = { [trackId: string]: MediaStreamTrack }
type DispatchTrackMapContext = React.Dispatch<React.SetStateAction<TrackMap>>
type TrackStatsMap = { [trackId: string]: RTCStatsReport }
type DispatchTrackStatsMap = React.Dispatch<React.SetStateAction<TrackStatsMap>>

const RemoteVideoTracksContext = React.createContext<TrackMap | null>(null)
const DispatchRemoteVideoTracksContext = React.createContext<DispatchTrackMapContext | null>(null)

const RemoteAudioTracksContext = React.createContext<TrackMap | null>(null)
const DispatchRemoteAudioTracksContext = React.createContext<DispatchTrackMapContext | null>(null)

const TrackStatsContext = React.createContext<TrackStatsMap | null>(null)
const DispatchTrackStatsContext = React.createContext<DispatchTrackStatsMap | null>(null)

const WebRTCProvider = ({children}: { children: React.ReactNode }) => {
  const [remoteVideoTracks, setRemoteVideoTracks] = React.useState<TrackMap>({})
  const [remoteAudioTracks, setRemoteAudioTracks] = React.useState<TrackMap>({})
  const [trackStatistics, setTrackStatistics] = React.useState<TrackStatsMap>({})

  return (
    <DispatchRemoteVideoTracksContext.Provider value={setRemoteVideoTracks}>
      <RemoteVideoTracksContext.Provider value={remoteVideoTracks}>
        <DispatchRemoteAudioTracksContext.Provider
          value={setRemoteAudioTracks}
        >
          <RemoteAudioTracksContext.Provider value={remoteAudioTracks}>
            <DispatchTrackStatsContext.Provider
              value={setTrackStatistics}
            >
              <TrackStatsContext.Provider value={trackStatistics}>
                {children}
              </TrackStatsContext.Provider>
            </DispatchTrackStatsContext.Provider>
          </RemoteAudioTracksContext.Provider>
        </DispatchRemoteAudioTracksContext.Provider>
      </RemoteVideoTracksContext.Provider>
    </DispatchRemoteVideoTracksContext.Provider>
  )
}
const useWebRTCRemoteVideos = (): TrackMap => {
  const state = React.useContext(RemoteVideoTracksContext)
  if (state === null)
    throw new Error('useWebRTCRemoteVideoTracks must be used within a WebRTCProvider')
  return state
}
const useWebRTCRemoteAudioTracks = (): TrackMap => {
  const state = React.useContext(RemoteAudioTracksContext)
  if (state === null)
    throw new Error('useWebRTCRemoteAudioTracks must be used within a WebRTCProvider')
  return state
}

export interface WebRTCStatistics {
  // Packet jitter in s
  jitter?: number
  // Average jitter buffer delay in ms
  jitterBufferDelay?: number
  // Avarage Round trip total in ms
  roundTripTime?: number
}

const useWebRTCStats = (trackId: string): WebRTCStatistics | undefined => {
  const state = React.useContext(TrackStatsContext)
  if (state === null) throw new Error('useWebRTCStats must be used within a WebRTCProvider')
  const trackStats = state[trackId]
  return React.useMemo(() => {
    if (trackStats) {
      const stats: WebRTCStatistics = {}
      trackStats.forEach((value, key) => {
        if (key.startsWith('RTCIceCandidatePair')) {
          if (value.currentRoundTripTime) {
            stats.roundTripTime = round(parseFloat(value.currentRoundTripTime) * 1000)
          } else if (value.roundTripTime) {
            stats.roundTripTime = round(parseFloat(value.roundTripTime) * 1000)
          } else if (value.totalRoundTripTime && value.roundTripTimeMeasurements) {
            stats.roundTripTime = round(
              (parseFloat(value.roundTripTime) /
                parseFloat(value.roundTripTimeMeasurements)) *
              1000
            )
          }
        }
        if (key.startsWith('RTCInboundRTP') && value.jitter) {
          stats.jitter = round(parseFloat(value.jitter), 2)
        }
        if (
          key.startsWith('RTCMediaStreamTrack') &&
          value.jitterBufferDelay &&
          value.jitterBufferEmittedCount
        ) {
          stats.jitterBufferDelay = round(
            (parseFloat(value.jitterBufferDelay) /
              parseInt(value.jitterBufferEmittedCount)) *
            1000
          )
        }
      })
      return stats
    }
    return undefined
  }, [trackStats])
}

const WebRTCService = (): JSX.Element | null => {
  const state = useTrackedSelector()
  const initialized = selectReady(state)
  const connection = useConnection()
  const emit = connection ? connection.emit : undefined
  const reportError = useErrorReporting()
  const [connected, setConnected] = React.useState<boolean>(false)
  const broker = React.useRef<Broker>(new Broker())
  const useP2P = selectP2PEnabled(state)
  const stageId = selectCurrentStageId(state)
  const videoType = selectCurrentVideoType(state)
  const audioType = selectCurrentAudioType(state)
  const stageDeviceIds = state.globals.stageId && state.globals.localStageDeviceId
    ? state.stageDevices.byStage[state.globals.stageId]?.filter((id) => id !== state.globals.localStageDeviceId && state.stageDevices.byId[id].active) || []
    : []
  React.useEffect(() => {
    if (connection) {
      const currentBroker = broker.current
      connection.on(ServerDeviceEvents.P2PRestart, currentBroker.handleRestart)
      connection.on(ServerDeviceEvents.P2POfferSent, currentBroker.handleOffer)
      connection.on(ServerDeviceEvents.P2PAnswerSent, currentBroker.handleAnswer)
      connection.on(ServerDeviceEvents.IceCandidateSent, currentBroker.handleIceCandidate)
      setConnected(true)
      return () => {
        setConnected(false)
        connection.on(ServerDeviceEvents.P2PRestart, currentBroker.handleRestart)
        connection.off(ServerDeviceEvents.P2POfferSent, currentBroker.handleOffer)
        connection.off(ServerDeviceEvents.P2PAnswerSent, currentBroker.handleAnswer)
        connection.off(
          ServerDeviceEvents.IceCandidateSent,
          currentBroker.handleIceCandidate
        )
      }
    }
  }, [connection])

  /**
   * Capture local video track
   */
  const localVideoTrack = useWebcam()
  const [publishedVideoTrack, setPublishedVideoTrack] = React.useState<MediaStreamTrack>()
  React.useEffect(() => {
    if (
      emit &&
      stageId &&
      videoType === 'mediasoup' &&
      localVideoTrack &&
      useP2P
    ) {
      let publishedId: string
      const track = localVideoTrack.clone()
      const settings = localVideoTrack.getSettings()
      const capabilities = !!localVideoTrack.getCapabilities && localVideoTrack.getCapabilities()
      publishTrack(emit, stageId, 'video', {
        capabilities,
        ...settings,
        trackId: localVideoTrack.id,
        type: 'browser',
      })
        .then((videoTrack) => {
          publishedId = videoTrack._id
          setPublishedVideoTrack(track)
          trace(`Published local video track with trackId ${track.id} as video ${publishedId}`)
        })
        .catch(error => {
          reportError(`Could not publish local video track ${track.id}. Reason: ${error}`)
        })
      return () => {
        setPublishedVideoTrack(undefined)
        if (publishedId) {
          unpublishTrack(emit, publishedId, "video")
            .then(() => trace(`Un-published local video track ${track.id} published as video ${publishedId}`))
            .catch(error => reportError(`Could not un-publish local video track ${track?.id} published as video ${publishedId}. Reason: ${error}`))
        }
        if (track) {
          track.stop()
        }
      }
    }
  }, [useP2P, stageId, videoType, emit, localVideoTrack, reportError])

  /**
   * Capture local audio track
   */
  const localAudioTrack = useMicrophone()
  const [publishedAudioTrack, setPublishedAudioTrack] = React.useState<MediaStreamTrack>()
  React.useEffect(() => {
    if (
      emit &&
      stageId &&
      audioType === 'mediasoup' &&
      useP2P &&
      localAudioTrack
    ) {
      let publishedId: string | undefined
      const track = localAudioTrack.clone()
      const settings = localAudioTrack.getSettings()
      const capabilities = localAudioTrack.getCapabilities()
      publishTrack(emit, stageId, 'audio', {
        capabilities,
        ...settings,
        trackId: localAudioTrack.id,
        type: 'browser',
      })
        .then((audioTrack) => {
          publishedId = audioTrack._id
          setPublishedAudioTrack(track)
          trace(`Published local audio track with trackId ${track.id} as audio ${publishedId}`)
        })
        .catch(error => reportError(`Could not publish local audio track ${track.id}. Reason: ${error}`))
      return () => {
        if (publishedId) {
          unpublishTrack(emit, publishedId, "audio")
            .then(() => trace(`Un-published local audio track ${track.id} published as audio ${publishedId}`))
            .catch((error) => reportError(`Could not un-publish local audio track ${track?.id} published as audio ${publishedId}. Reason: ${error}`))
        }
        setPublishedAudioTrack(undefined)
        if (track) {
          track.stop()
        }
      }
    }
  }, [useP2P, stageId, audioType, emit, reportError, localAudioTrack])

  const setRemoteVideoTracks = React.useContext(DispatchRemoteVideoTracksContext)
  const setRemoteAudioTracks = React.useContext(DispatchRemoteAudioTracksContext)

  const onRemoteTrack = React.useCallback(
    (stageDeviceId: string, track: MediaStreamTrack) => {
      trace('Got track with trackId', track.id)
      const dispatch = track.kind === 'video' ? setRemoteVideoTracks : setRemoteAudioTracks
      if (dispatch) {
        trace('Adding track with trackId', track.id)
        dispatch((prev) => ({
          ...prev,
          [stageDeviceId]: track,
        }))
        const onEndTrack = () => {
          dispatch((prev) => omit(prev, stageDeviceId))
          track.removeEventListener('mute', onEndTrack)
          track.removeEventListener('ended', onEndTrack)
        }
        track.addEventListener('mute', onEndTrack)
        track.addEventListener('ended', onEndTrack)
      } else {
        console.error("Dispatch is still null...")
      }
    },
    [setRemoteAudioTracks, setRemoteVideoTracks]
  )
  const setWebRTCStats = React.useContext(DispatchTrackStatsContext)
  const onStats = React.useCallback(
    (trackId: string, stats: RTCStatsReport) => {
      if (setWebRTCStats)
        setWebRTCStats((prev) => ({
          ...prev,
          [trackId]: stats,
        }))
    },
    [setWebRTCStats]
  )
  if (initialized && connected) {
    return (
      <>
        {stageDeviceIds.map((stageDeviceId) => (
          <PeerConnection
            key={stageDeviceId}
            videoTrack={publishedVideoTrack}
            audioTrack={publishedAudioTrack}
            stageDeviceId={stageDeviceId}
            onRemoteTrack={onRemoteTrack}
            onStats={onStats}
            broker={broker.current}
          />
        ))}
      </>
    )
  }
  return null
}
export {
  WebRTCService,
  WebRTCProvider,
  useWebRTCRemoteVideos,
  useWebRTCRemoteAudioTracks,
  useWebRTCStats,
}

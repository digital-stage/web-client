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
import {MediasoupAudioTrack, MediasoupVideoTrack} from '@digitalstage/api-types'
import {RootState} from 'api/redux/RootState'
import {useTrackedSelector} from 'api/redux/selectors/useTrackedSelector'
import {selectCurrentAudioType, selectCurrentStageId, selectCurrentVideoType, selectToken} from "api/redux/selectors";
import {useEmit} from '../ConnectionService'
import {useErrorReporting} from 'api/hooks/useErrorReporting'
import {useWebcam} from 'api/provider/WebcamProvider'
import {useMicrophone} from 'api/provider/MicrophoneProvider'
import {ConsumersList, Events, MediasoupHandler} from "./MediasoupHandler";

type DispatchConsumersList = React.Dispatch<React.SetStateAction<ConsumersList>>
const ConsumersListContext = React.createContext<ConsumersList | null>(null)
const DispatchConsumersListContext = React.createContext<DispatchConsumersList | null>(null)
const MediasoupProvider = ({children}: { children: React.ReactNode }): JSX.Element => {
  const [consumers, setConsumers] = React.useState<ConsumersList>({})
  return (
    <DispatchConsumersListContext.Provider value={setConsumers}>
      <ConsumersListContext.Provider value={consumers}>
        {children}
      </ConsumersListContext.Provider>
    </DispatchConsumersListContext.Provider>
  )
}

const useConsumers = (): ConsumersList => {
  const state = React.useContext<ConsumersList | null>(ConsumersListContext)
  if (state === null)
    throw new Error('useConsumers must be used within a MediasoupProvider')
  return state
}

const selectRouterUrl = (state: RootState) => {
  if (state.globals.stageId) {
    const {audioType, videoType, mediasoup} = state.stages.byId[state.globals.stageId]
    if ((videoType === 'mediasoup' || audioType === 'mediasoup') && mediasoup?.url && mediasoup?.port) {
      return `${mediasoup.url}:${mediasoup.port}`
    }
  }
  return undefined
}
const selectCurrentMediasoupVideoTracks = (state: RootState) =>
  state.globals.stageId && state.globals.localStageDeviceId && state.videoTracks.byStage[state.globals.stageId]
    ? (state.videoTracks.byStage[state.globals.stageId]
      .map((id) => state.videoTracks.byId[id])
      .filter(
        (track) =>
          track.type === 'mediasoup' && track.stageDeviceId !== state.globals.localStageDeviceId
      ) as MediasoupVideoTrack[])
    : []
const selectCurrentMediasoupAudioTracks = (state: RootState) =>
  state.globals.stageId && state.globals.localStageDeviceId && state.audioTracks.byStage[state.globals.stageId]
    ? (state.audioTracks.byStage[state.globals.stageId]
      .map((id) => state.audioTracks.byId[id])
      .filter(
        (track) =>
          track.type === 'mediasoup' && track.stageDeviceId !== state.globals.localStageDeviceId
      ) as MediasoupAudioTrack[])
    : []

const MediasoupService = (): JSX.Element | null => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const token = selectToken(state)
  const reportError = useErrorReporting()
  const useP2P = state.globals.localDeviceId ? state.devices.byId[state.globals.localDeviceId].useP2P : undefined
  const stageId = selectCurrentStageId(state)
  const routerUrl = selectRouterUrl(state)
  const audioType = selectCurrentAudioType(state)
  const videoType = selectCurrentVideoType(state)
  const [handler, setHandler] = React.useState<MediasoupHandler>()

  // Creating connection to router
  React.useEffect(() => {
    if (routerUrl && reportError && token && stageId && emit) {
      const createdHandler = new MediasoupHandler(token, routerUrl, stageId, emit)
      createdHandler.on(Events.Error, (err) => reportError(err))
      createdHandler.on(Events.Connected, () => {
        setHandler(createdHandler)
      })
      createdHandler.on(Events.Disconnected, () => {
        setHandler(undefined)
      })
      createdHandler.connect()
    }
  }, [routerUrl, emit, token, stageId, reportError,])

  const videoTracks = selectCurrentMediasoupVideoTracks(state)
  const audioTracks = selectCurrentMediasoupAudioTracks(state)
  const setConsumers = React.useContext<DispatchConsumersList | null>(DispatchConsumersListContext)
  // Sync video tracks by creating consumers
  React.useEffect(() => {
    if (setConsumers && handler) {
      handler.syncWithPublicTracks([...videoTracks, ...audioTracks])
        .then(consumers =>
          setConsumers(consumers)
        )
    }
  }, [handler, videoTracks, audioTracks, setConsumers])

  const localVideoTrack = useWebcam()
  React.useEffect(() => {
    if (handler && videoType === 'mediasoup' && !useP2P && localVideoTrack && reportError) {
      handler.addTrack(localVideoTrack)
        .catch(error => reportError(error))
      return () => {
        handler.removeTrack(localVideoTrack.id)
          .catch(error => reportError(error))
      }
    }
  }, [handler, videoType, useP2P, localVideoTrack, reportError])
  const localAudioTrack = useMicrophone()
  React.useEffect(() => {
    if (handler && audioType === 'mediasoup' && !useP2P && localAudioTrack && reportError) {
      handler.addTrack(localAudioTrack)
        .catch(error => reportError(error))
      return () => {
        handler.removeTrack(localAudioTrack.id)
          .catch(error => reportError(error))
      }
    }
  }, [handler, audioType, useP2P, localAudioTrack, reportError])

  return null
}
export {
  MediasoupService,
  MediasoupProvider,
  useConsumers,
}

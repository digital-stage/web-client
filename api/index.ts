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

import {DigitalStageProvider} from './DigitalStageProvider'
import {useAuth} from './hooks/useAuth'
import {useNotification} from './hooks/useNotification'
import {AppDispatch} from './redux/store'
import {useStageSelector} from './redux/selectors/useStageSelector'
import {RootState} from './redux/state'
import {useAudioContext, useAudioContextDispatch} from './provider/AudioContextProvider'
import {useAudioLevel} from './provider/AudioLevelProvider'
import {useStageJoiner} from './hooks/useStageJoiner'
import {
  useWebRTCStats,
} from './services/WebRTCService'
import {useEmit, useConnection, ConnectionStateContext, EmitFunction} from './services/ConnectionService'
import {useErrorReporting} from './hooks/useErrorReporting'
import {logger} from './logger'
import {useCurrentStageAdminSelector} from './redux/selectors/useCurrentStageAdminSelector'
import {useStageAdminSelector} from './redux/selectors/useStageAdminSelector'
import {useSpatialAudioSelector} from './redux/selectors/useSpatialAudioSelector'
import {useRemoteVideoTracks} from './hooks/useRemoteVideoTracks'
import {useRemoteAudioTracks} from './hooks/useRemoteAudioTracks'
import {useReady} from './hooks/useReady'
import {useWebcam} from './provider/WebcamProvider'
import {useMicrophone} from './provider/MicrophoneProvider'
import {sortStageMembers, useFilteredStageMembers} from './hooks/useFilteredStageMembers'
import {useShowOffline} from './hooks/useShowOffline'
import {useLocalDeviceId} from './hooks/useLocalDeviceId'
import { useShowLanes } from './hooks/useShowLanes'
import { useToggleLanes } from './hooks/useToggleLanes'
import { useToggleOffline } from './hooks/useToggleOffline'

export * from './redux/actions'
export * from './redux/state'
export type {RootState, AppDispatch, EmitFunction}
export {
  useReady,
  useStageJoiner,
  useFilteredStageMembers,
  sortStageMembers,
  useAudioContext,
  useAudioContextDispatch,
  useAudioLevel,
  useStageSelector,
  useStageAdminSelector,
  useCurrentStageAdminSelector,
  useShowOffline,
  useShowLanes,
  useToggleLanes,
  useToggleOffline,
  useLocalDeviceId,
  DigitalStageProvider,
  useNotification,
  useEmit,
  useConnection,
  useAuth,
  useWebRTCStats,
  useWebcam,
  useMicrophone,
  useRemoteVideoTracks,
  useRemoteAudioTracks,
  useErrorReporting,
  useSpatialAudioSelector,
  ConnectionStateContext,
  logger
}

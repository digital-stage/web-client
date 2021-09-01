import { DigitalStageProvider } from './DigitalStageProvider'
import { useAnimationFrame } from './hooks/useAnimationFrame'
import { useAuth } from './hooks/useAuth'
import { useNotification } from './hooks/useNotification'
import { AppDispatch } from './redux/store'
import { useStageSelector } from './redux/useStageSelector'
import { RootState } from './redux/state'
import { useAudioContext, useAudioContextDispatch } from './provider/AudioContextProvider'
import { useAudioLevel } from './provider/AudioLevelProvider'
import { useStageJoiner } from './hooks/useStageJoiner'
import {
    useWebRTCLocalAudioTrack,
    useWebRTCRemoteAudioTrack,
    useWebRTCRemoteAudioTracks,
    useWebRTCRemoteVideoTrack,
    useWebRTCRemoteVideoTracks,
    useWebRTCStats,
} from './services/WebRTCService'
import { useWebRTCLocalVideoTrack } from './services/WebRTCService'
import { useVideoConsumers } from './services/MediasoupService'
import { useVideoProducer } from './services/MediasoupService'
import { useEmit, useConnection, ConnectionStateContext } from './services/ConnectionService'
import { useErrorReporting } from './hooks/useErrorReporting'
import { logger } from './logger'

export * from './redux/actions'
export * from './redux/state'
export type { RootState, AppDispatch }
export {
    useStageJoiner,
    useAudioContext,
    useAudioContextDispatch,
    useAudioLevel,
    useStageSelector,
    DigitalStageProvider,
    useAnimationFrame,
    useNotification,
    useEmit,
    useConnection,
    useAuth,
    useWebRTCLocalVideoTrack,
    useWebRTCRemoteVideoTracks,
    useWebRTCRemoteVideoTrack,
    useWebRTCLocalAudioTrack,
    useWebRTCRemoteAudioTracks,
    useWebRTCRemoteAudioTrack,
    useWebRTCStats,
    useVideoProducer,
    useVideoConsumers,
    useErrorReporting,
    ConnectionStateContext,
    logger,
}

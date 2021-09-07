import { DigitalStageProvider } from './DigitalStageProvider'
import { useAuth } from './hooks/useAuth'
import { useNotification } from './hooks/useNotification'
import { AppDispatch } from './redux/store'
import { useStageSelector } from './redux/selectors/useStageSelector'
import { RootState } from './redux/state'
import { useAudioContext, useAudioContextDispatch } from './provider/AudioContextProvider'
import { useAudioLevel } from './provider/AudioLevelProvider'
import { useStageJoiner } from './hooks/useStageJoiner'
import {
    useWebRTCLocalAudioTrack,
    useWebRTCRemoteAudioTrackByStageDevice,
    useWebRTCRemoteAudioTracks,
    useWebRTCRemoteVideoByStageDevice,
    useWebRTCRemoteVideos,
    useWebRTCStats,
} from './services/WebRTCService'
import { useWebRTCLocalVideo } from './services/WebRTCService'
import {
    useAudioConsumer,
    useAudioConsumers,
    useVideoConsumer,
    useVideoConsumers,
} from './services/MediasoupService'
import { useVideoProducer } from './services/MediasoupService'
import { useEmit, useConnection, ConnectionStateContext } from './services/ConnectionService'
import { useErrorReporting } from './hooks/useErrorReporting'
import { logger } from './logger'
import { useCurrentStageAdminSelector } from './redux/selectors/useCurrentStageAdminSelector'
import { useStageAdminSelector } from './redux/selectors/useStageAdminSelector'
import { useSpatialAudioSelector } from './redux/selectors/useSpatialAudioSelector'

export * from './redux/actions'
export * from './redux/state'
export type { RootState, AppDispatch }
export {
    useStageJoiner,
    useAudioContext,
    useAudioContextDispatch,
    useAudioLevel,
    useStageSelector,
    useStageAdminSelector,
    useCurrentStageAdminSelector,
    DigitalStageProvider,
    useNotification,
    useEmit,
    useConnection,
    useAuth,
    useWebRTCLocalVideo,
    useWebRTCRemoteVideos,
    useWebRTCRemoteVideoByStageDevice,
    useWebRTCLocalAudioTrack,
    useWebRTCRemoteAudioTracks,
    useWebRTCRemoteAudioTrackByStageDevice,
    useWebRTCStats,
    useVideoProducer,
    useVideoConsumers,
    useVideoConsumer,
    useAudioConsumers,
    useAudioConsumer,
    useErrorReporting,
    useSpatialAudioSelector,
    ConnectionStateContext,
    logger,
}

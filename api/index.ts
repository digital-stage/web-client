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
    useWebRTCStats,
} from './services/WebRTCService'
import { useEmit, useConnection, ConnectionStateContext } from './services/ConnectionService'
import { useErrorReporting } from './hooks/useErrorReporting'
import { logger } from './logger'
import { useCurrentStageAdminSelector } from './redux/selectors/useCurrentStageAdminSelector'
import { useStageAdminSelector } from './redux/selectors/useStageAdminSelector'
import { useSpatialAudioSelector } from './redux/selectors/useSpatialAudioSelector'
import { useRemoteVideos } from './hooks/useRemoteVideos'
import { useRemoteAudioTracks } from './hooks/useRemoteAudioTracks'
import { useReady } from './hooks/useReady'
import { useWebcam } from './provider/WebcamProvider'
import { useMicrophone } from './provider/MicrophoneProvider'
import {sortStageMembers, useFilteredStageMembers } from './hooks/useFilteredStageMembers'

export * from './redux/actions'
export * from './redux/state'
export type { RootState, AppDispatch }
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
    DigitalStageProvider,
    useNotification,
    useEmit,
    useConnection,
    useAuth,
    useWebRTCStats,
    useWebcam,
    useMicrophone,
    useRemoteVideos,
    useRemoteAudioTracks,
    useErrorReporting,
    useSpatialAudioSelector,
    ConnectionStateContext,
    logger
}

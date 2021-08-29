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
import { useWebRTCRemoteVideoTracks } from './services/WebRTCService'
import { useWebRTCLocalVideoTracks } from './services/WebRTCService'
import { useVideoConsumers } from './services/MediasoupService'
import { useVideoProducers } from './services/MediasoupService'
import { useEmit, useConnection, ConnectionStateContext } from './services/ConnectionService'
import { useErrorReporting } from './hooks/useErrorReporting'

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
    useWebRTCLocalVideoTracks,
    useWebRTCRemoteVideoTracks,
    useVideoProducers,
    useVideoConsumers,
    useErrorReporting,
    ConnectionStateContext,
}

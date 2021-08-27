import { DigitalStageProvider } from './DigitalStageProvider'
import { useAnimationFrame } from './hooks/useAnimationFrame'
import { useAuth } from './hooks/useAuth'
import { useReport } from './hooks/useReport'
import { AppDispatch } from './redux/store'
import { useStageSelector } from './redux/useStageSelector'
import { RootState } from './redux/state'
import { useAudioContext, useAudioContextDispatch } from './provider/AudioContextProvider'
import { useAudioLevel } from './provider/AudioLevelProvider'
import { useStageJoiner } from './hooks/useStageJoiner'
import { useRemoteVideoTracks } from './services/WebRTCService'
import { useLocalVideoTracks } from './services/WebRTCService'
import { useVideoConsumers } from './services/MediasoupService'
import { useVideoProducers } from './services/MediasoupService'
import { useEmit, useConnection, ConnectionStateContext } from './services/ConnectionService'

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
    useReport,
    useEmit,
    useConnection,
    useAuth,
    useLocalVideoTracks,
    useRemoteVideoTracks,
    useVideoProducers,
    useVideoConsumers,
    ConnectionStateContext,
}

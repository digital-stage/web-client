import { Provider } from 'react-redux'
import store from './redux/store'
import * as React from 'react'
import DigitalStageServices from './services/DigitalStageServices'
import { ConnectionProvider } from './hooks/useConnection'
import { AudioContextProvider } from './services/AudioRenderer/useAudioContext'
import { WebRTCProvider } from './hooks/useWebRTCTracks'
import { StageJoinerProvider } from './hooks/useStageJoiner'

const MemorizedDigitalStageServices = React.memo(DigitalStageServices)

const DigitalStageProvider = ({ children }: { children: React.ReactNode }) => {
    return (
        <Provider store={store}>
            <ConnectionProvider>
                <StageJoinerProvider>
                    <AudioContextProvider>
                        <WebRTCProvider>
                            <MemorizedDigitalStageServices />
                            {children}
                        </WebRTCProvider>
                    </AudioContextProvider>
                </StageJoinerProvider>
            </ConnectionProvider>
        </Provider>
    )
}
export default DigitalStageProvider

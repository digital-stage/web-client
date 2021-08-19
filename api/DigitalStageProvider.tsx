import { Provider } from 'react-redux'
import store from './redux/store'
import * as React from 'react'
import DigitalStageServices from './services/DigitalStageServices'
import StageHandlingProvider from './provider/StageHandlingProvider'
import ConnectionProvider from './provider/ConnectionProvider'
import WebRTCProvider from './provider/WebRTCProvider'
import AudioContextProvider from './provider/AudioContextProvider'

const MemorizedDigitalStageServices = React.memo(DigitalStageServices)

const DigitalStageProvider = ({ children }: { children: React.ReactNode }) => {
    if (!process.browser) {
        return <Provider store={store}>{children}</Provider>
    }

    return (
        <Provider store={store}>
            <ConnectionProvider>
                <StageHandlingProvider>
                    <AudioContextProvider>
                        <WebRTCProvider>
                            <MemorizedDigitalStageServices />
                            {children}
                        </WebRTCProvider>
                    </AudioContextProvider>
                </StageHandlingProvider>
            </ConnectionProvider>
        </Provider>
    )
}
export default DigitalStageProvider

import { Provider } from 'react-redux'
import store from './redux/store'
import * as React from 'react'
import DigitalStageServices from './services/DigitalStageServices'
import StageHandlingProvider from './provider/StageHandlingProvider'
import WebRTCProvider from './provider/WebRTCProvider'
import AudioContextProvider from './provider/AudioContextProvider'
import ReportingProvider from './provider/ReportingProvider'

const MemorizedDigitalStageServices = React.memo(DigitalStageServices)

const DigitalStageProvider = ({ children }: { children: React.ReactNode }) => {
    if (!process.browser) {
        return <Provider store={store}>{children}</Provider>
    }

    return (
        <Provider store={store}>
            <ReportingProvider>
                <StageHandlingProvider>
                    <AudioContextProvider>
                        <WebRTCProvider>
                            <MemorizedDigitalStageServices />
                            {children}
                        </WebRTCProvider>
                    </AudioContextProvider>
                </StageHandlingProvider>
            </ReportingProvider>
        </Provider>
    )
}
export default DigitalStageProvider

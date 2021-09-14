import {Provider} from 'react-redux'
import {store} from './redux/store'
import * as React from 'react'
import {AudioContextProvider} from './provider/AudioContextProvider'
import {ConnectionProvider} from './services/ConnectionService'
import {AudioLevelProvider} from './provider/AudioLevelProvider'
import {DigitalStageServices} from './services/DigitalStageServices'
import {MediasoupProvider} from './services/MediasoupService'
import {WebRTCProvider} from './services/WebRTCService'
import {ErrorBoundary} from './services/ErrorBoundary'

const MemoizedDigitalStageServices = React.memo(DigitalStageServices)

const DigitalStageProvider = ({children}: { children: React.ReactNode }) => (
    <Provider store={store}>
        <ErrorBoundary>
            <ConnectionProvider>
                <MediasoupProvider>
                    <WebRTCProvider>
                        <AudioContextProvider>
                            <AudioLevelProvider>
                                <MemoizedDigitalStageServices/>
                                {children}
                            </AudioLevelProvider>
                        </AudioContextProvider>
                    </WebRTCProvider>
                </MediasoupProvider>
            </ConnectionProvider>
        </ErrorBoundary>
    </Provider>
)
export {DigitalStageProvider}

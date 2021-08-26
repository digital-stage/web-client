import { Provider } from 'react-redux'
import store from './redux/store'
import * as React from 'react'
import { AudioContextProvider } from './provider/AudioContextProvider'
import { ConnectionProvider } from './provider/ConnectionProvider'
import { AudioLevelProvider } from './provider/AudioLevelProvider'
import { DigitalStageServices } from './services/DigitalStageServices'
import { TrackProvider } from './provider/TrackProvider'

const DigitalStageProvider = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
        <ConnectionProvider>
            <TrackProvider>
                <AudioContextProvider>
                    <AudioLevelProvider>
                        <DigitalStageServices />
                        {children}
                    </AudioLevelProvider>
                </AudioContextProvider>
            </TrackProvider>
        </ConnectionProvider>
    </Provider>
)
export { DigitalStageProvider }

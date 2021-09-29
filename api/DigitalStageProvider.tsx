/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {Provider} from 'react-redux'
import {store} from './redux/store'
import * as React from 'react'
import {AudioContextProvider} from './provider/AudioContextProvider'
import {ConnectionProvider} from './services/ConnectionService'
import {AudioLevelProvider} from './provider/AudioLevelProvider'
import {DigitalStageServices} from './services/DigitalStageServices'
import {MediasoupProvider} from './services/MediasoupService'
import {WebRTCProvider} from './services/WebRTCService'
import {WebcamProvider} from "./provider/WebcamProvider";
import {MicrophoneProvider} from "./provider/MicrophoneProvider";
import {AudioNodeProvider} from "./provider/AudioNodeProvider";


const DigitalStageProvider = ({children}: { children: React.ReactNode }) => (
    <Provider store={store}>
        <ConnectionProvider>
            <WebcamProvider>
                <MicrophoneProvider>
                    <MediasoupProvider>
                        <WebRTCProvider>
                            <AudioContextProvider>
                                <AudioNodeProvider>
                                    <AudioLevelProvider>
                                        <DigitalStageServices/>
                                        {children}
                                    </AudioLevelProvider>
                                </AudioNodeProvider>
                            </AudioContextProvider>
                        </WebRTCProvider>
                    </MediasoupProvider>
                </MicrophoneProvider>
            </WebcamProvider>
        </ConnectionProvider>
    </Provider>
)
export {DigitalStageProvider}

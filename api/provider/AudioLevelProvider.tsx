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

import omit from 'lodash/omit'
import * as React from 'react'

type Action = { type: 'add'; id: string; level: ArrayBuffer } | { type: 'remove'; id: string }
type State = { [id: string]: ArrayBuffer }
type Dispatch = (action: Action) => void

const AudioLevelStateContext = React.createContext<State>(undefined)
const AudioLevelDispatchContext = React.createContext<Dispatch>(undefined)

function audioLevelReducer(prevState: State, action: Action) {
    switch (action.type) {
        case 'add': {
            return {
                ...prevState,
                [action.id]: action.level,
            }
        }
        case 'remove': {
            return omit(prevState, action.id)
        }
        default:
            throw new Error('Unknown action')
    }
}

const AudioLevelProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(audioLevelReducer, {})

    const stateValue = React.useMemo(() => state, [state])

    return (
        <AudioLevelDispatchContext.Provider value={dispatch}>
            <AudioLevelStateContext.Provider value={stateValue}>
                {children}
            </AudioLevelStateContext.Provider>
        </AudioLevelDispatchContext.Provider>
    )
}

const useAudioLevel = () => {
    const state = React.useContext(AudioLevelStateContext)
    if (state === undefined) {
        throw new Error('useAudioLevel must be used within a AudioLevelProvider')
    }
    return state
}
const useAudioLevelDispatch = () => {
    const dispatch = React.useContext(AudioLevelDispatchContext)
    if (dispatch === undefined) {
        throw new Error('useAudioLevelDispatch must be used within a AudioLevelProvider')
    }
    return dispatch
}

export { useAudioLevel, useAudioLevelDispatch, AudioLevelProvider }

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

type Action = { type: 'add'; id: string; node: AudioNode } | { type: 'remove'; id: string }
type State = { [id: string]: AudioNode }
type Dispatch = (action: Action) => void

const AudioNodeStateContext = React.createContext<State | null>(null)
const AudioNodeDispatchContext = React.createContext<Dispatch | null>(null)

function audioNodeReducer(prevState: State, action: Action) {
    switch (action.type) {
        case 'add': {
            return {
                ...prevState,
                [action.id]: action.node,
            }
        }
        case 'remove': {
            return omit(prevState, action.id)
        }
        default:
            throw new Error('Unknown action')
    }
}

const AudioNodeProvider = ({ children }: { children: React.ReactNode }) : JSX.Element => {
    const [state, dispatch] = React.useReducer(audioNodeReducer, {})

    const stateValue = React.useMemo(() => state, [state])

    return (
        <AudioNodeDispatchContext.Provider value={dispatch}>
            <AudioNodeStateContext.Provider value={stateValue}>
                {children}
            </AudioNodeStateContext.Provider>
        </AudioNodeDispatchContext.Provider>
    )
}

const useAudioNode = (): State => {
    const state = React.useContext(AudioNodeStateContext)
    if (state === null) {
        throw new Error('useAudioLevel must be used within a AudioNodeProvider')
    }
    return state
}
const useAudioNodeDispatch = (): Dispatch => {
    const dispatch = React.useContext(AudioNodeDispatchContext)
    if (dispatch === null) {
        throw new Error('useAudioLevelDispatch must be used within a AudioNodeProvider')
    }
    return dispatch
}

export { useAudioNode, useAudioNodeDispatch, AudioNodeProvider }

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

import React from 'react'
import { createBuffer, startAudioContext } from './utils'
import { logger } from '../../logger'

const { trace, warn } = logger('AudioContextProvider')

type Action =
    | { type: 'start'; sampleRate?: number; sinkId?: string; dispatch: Dispatch }
    | { type: 'setSinkId'; sinkId?: string }
    | { type: 'setRunning'; running: boolean }
type State = {
    running?: boolean
    audioContext?: AudioContext
    destination?: MediaStreamAudioDestinationNode
    player?: HTMLAudioElement
}
type Dispatch = (action: Action) => void

const AudioContextStateContext = React.createContext<State>(undefined)
const AudioContextDispatchContext = React.createContext<Dispatch>(undefined)

function audioContextReducer(prevState: State, action: Action): State {
    switch (action.type) {
        case 'start': {
            trace('Starting audio context with sample rate of ' + action.sampleRate)
            let audioContext = prevState.audioContext
            let destination = prevState.destination
            let player = prevState.player || new Audio()
            if (
                !audioContext ||
                (audioContext && action.sampleRate && audioContext.sampleRate !== action.sampleRate)
            ) {
                // (Re)creation necessary
                if (audioContext) {
                    trace('Closing audio context')
                    audioContext.close().catch((err) => warn(err))
                    audioContext.onstatechange = undefined
                }
                audioContext = createBuffer(action.sampleRate)
                audioContext.onstatechange = (e: any) => {
                    if (e.currentTarget.state === 'running') {
                        action.dispatch({ type: 'setRunning', running: true })
                    } else {
                        action.dispatch({ type: 'setRunning', running: false })
                    }
                }
                destination = audioContext.createMediaStreamDestination()
                player.srcObject = destination.stream
            }
            if (audioContext.state === 'running') {
                action.dispatch({ type: 'setRunning', running: true })
            } else {
                startAudioContext(audioContext, player).catch((err) => warn(err))
            }
            return {
                ...prevState,
                audioContext,
                destination,
                player,
            }
        }
        case 'setSinkId': {
            trace('Specifying sink ID', action.sinkId)
            const player = prevState.player || new Audio()
            if (action.sinkId && (player as any).sinkId !== undefined) {
                ;(player as any).setSinkId(action.sinkId)
            }
            return {
                ...prevState,
                player,
            }
        }
        case 'setRunning': {
            trace(`Now ${action.running ? `running` : `suspended`}`)
            return {
                ...prevState,
                running: action.running,
            }
        }
        default: {
            throw new Error('Unknown action')
        }
    }
}

const AudioContextProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const [state, dispatch] = React.useReducer(audioContextReducer, {})

    return (
        <AudioContextDispatchContext.Provider value={dispatch}>
            <AudioContextStateContext.Provider value={state}>
                {children}
            </AudioContextStateContext.Provider>
        </AudioContextDispatchContext.Provider>
    )
}

const useAudioContext = () => {
    const state = React.useContext(AudioContextStateContext)
    if (state === undefined) {
        throw new Error('useAudioContext must be used within a AudioContextProvider')
    }
    return state
}

const useAudioContextDispatch = () => {
    const dispatch = React.useContext(AudioContextDispatchContext)
    if (dispatch === undefined) {
        throw new Error('useAudioContext must be used within a AudioContextProvider')
    }
    return dispatch
}

export { useAudioContext, useAudioContextDispatch, AudioContextProvider }

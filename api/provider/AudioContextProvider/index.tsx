import { IAudioContext, IMediaStreamAudioDestinationNode } from 'standardized-audio-context'

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
    audioContext?: IAudioContext
    destination?: IMediaStreamAudioDestinationNode<IAudioContext>
    player?: HTMLAudioElement
}
type Dispatch = (action: Action) => void

const AudioContextStateContext = React.createContext<State>(undefined)
const AudioContextDispatchContext = React.createContext<Dispatch>(undefined)

function audioContextReducer(prevState: State, action: Action): State {
    switch (action.type) {
        case 'start': {
            trace('Starting audio context')
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

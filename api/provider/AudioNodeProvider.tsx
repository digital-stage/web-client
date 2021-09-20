import omit from 'lodash/omit'
import * as React from 'react'

type Action = { type: 'add'; id: string; node: AudioNode } | { type: 'remove'; id: string }
type State = { [id: string]: AudioNode }
type Dispatch = (action: Action) => void

const AudioNodeStateContext = React.createContext<State>(undefined)
const AudioNodeDispatchContext = React.createContext<Dispatch>(undefined)

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

const AudioNodeProvider = ({ children }: { children: React.ReactNode }) => {
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

const useAudioNode = () => {
    const state = React.useContext(AudioNodeStateContext)
    if (state === undefined) {
        throw new Error('useAudioLevel must be used within a AudioNodeProvider')
    }
    return state
}
const useAudioNodeDispatch = () => {
    const dispatch = React.useContext(AudioNodeDispatchContext)
    if (dispatch === undefined) {
        throw new Error('useAudioLevelDispatch must be used within a AudioNodeProvider')
    }
    return dispatch
}

export { useAudioNode, useAudioNodeDispatch, AudioNodeProvider }

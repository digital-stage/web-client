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

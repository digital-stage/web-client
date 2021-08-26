import { IAudioContext, IMediaStreamAudioDestinationNode } from 'standardized-audio-context'
import debug from 'debug'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { createBuffer, startAudioContext } from './utils'

const report = debug('AudioContextProvider')
const reportWarning = report.extend('warn')

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
            report('Starting audio context')
            let audioContext = prevState.audioContext
            let destination = prevState.destination
            let player = prevState.player || new Audio()
            if (
                !audioContext ||
                (audioContext && action.sampleRate && audioContext.sampleRate !== action.sampleRate)
            ) {
                // (Re)creation necessary
                if (audioContext) {
                    report('Closing audio context')
                    audioContext.close().catch((err) => reportWarning(err))
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
                startAudioContext(audioContext, player).catch((err) => reportWarning(err))
            }
            return {
                ...prevState,
                audioContext,
                destination,
                player,
            }
        }
        case 'setSinkId': {
            report('Specifying sink ID', action.sinkId)
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
            report(`Now ${action.running ? `running` : `suspended`}`)
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
    const sinkId = useStageSelector<string | undefined>((state) =>
        state.globals.localDeviceId
            ? (state.devices.byId[state.globals.localDeviceId].outputAudioDeviceId as never)
            : undefined
    )

    React.useEffect(() => {
        dispatch({ type: 'start', dispatch })
    }, [])

    React.useEffect(() => {
        if (sinkId) {
            report('BLABLABLA')
            dispatch({ type: 'setSinkId', sinkId })
        }
    }, [sinkId])

    /**
     * Try to start audio context with touch gesture on mobile devices
     */
    React.useEffect(() => {
        if (state.audioContext && state.player && !state.running) {
            report('Adding touch handler to start audio context')
            const resume = () =>
                startAudioContext(state.audioContext, state.player)
                    .then(() => report('Started audio context via touch gesture'))
                    .catch((err) => reportWarning(err))

            document.body.addEventListener('touchstart', resume, false)
            document.body.addEventListener('touchend', resume, false)
            return () => {
                report('Removed touch handler to start audio context')
                document.body.removeEventListener('touchstart', resume)
                document.body.removeEventListener('touchend', resume)
            }
        }
        return undefined
    }, [state.audioContext, state.player, state.running])

    const value = React.useMemo<State>(() => state, [state])

    return (
        <AudioContextDispatchContext.Provider value={dispatch}>
            <AudioContextStateContext.Provider value={value}>
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

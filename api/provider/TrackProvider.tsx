import React from 'react'
import omit from 'lodash/omit'
import debug from 'debug'

const report = debug('TrackProvider')

type Action =
    | { type: 'addLocalVideoTrack'; id: string; track: MediaStreamTrack }
    | { type: 'addLocalAudioTrack'; id: string; track: MediaStreamTrack }
    | { type: 'removeLocalVideoTrack'; id: string }
    | { type: 'removeLocalAudioTrack'; id: string }
    | { type: 'addRemoteVideoTrack'; id: string; track: MediaStreamTrack }
    | { type: 'addRemoteAudioTrack'; id: string; track: MediaStreamTrack }
    | { type: 'removeRemoteVideoTrack'; id: string }
    | { type: 'removeRemoteAudioTrack'; id: string }
type State = {
    localVideoTracks: {
        [trackId: string]: MediaStreamTrack
    }
    localAudioTracks: {
        [trackId: string]: MediaStreamTrack
    }
    remoteVideoTracks: {
        [trackId: string]: MediaStreamTrack
    }
    remoteAudioTracks: {
        [trackId: string]: MediaStreamTrack
    }
}
type Dispatch = (action: Action) => void

const TrackStateContext = React.createContext<State>(undefined)
const TrackDispatchContext = React.createContext<Dispatch>(undefined)

function reduceTracks(prevState: State, action: Action) {
    report(action.type)
    switch (action.type) {
        case 'addLocalVideoTrack': {
            const { id, track } = action
            return {
                ...prevState,
                localVideoTracks: {
                    ...prevState.localVideoTracks,
                    [id]: track,
                },
            }
        }
        case 'addLocalAudioTrack': {
            const { id, track } = action
            return {
                ...prevState,
                localAudioTracks: {
                    ...prevState.localAudioTracks,
                    [id]: track,
                },
            }
        }
        case 'removeLocalVideoTrack': {
            const { id } = action
            return {
                ...prevState,
                localVideoTracks: omit(prevState.localVideoTracks, id),
            }
        }
        case 'removeLocalAudioTrack': {
            const { id } = action
            return {
                ...prevState,
                localAudioTracks: omit(prevState.localAudioTracks, id),
            }
        }
        case 'addRemoteVideoTrack': {
            const { id, track } = action
            return {
                ...prevState,
                remoteVideoTracks: {
                    ...prevState.remoteVideoTracks,
                    [id]: track,
                },
            }
        }
        case 'addRemoteAudioTrack': {
            const { id, track } = action
            return {
                ...prevState,
                remoteAudioTracks: {
                    ...prevState.remoteAudioTracks,
                    [id]: track,
                },
            }
        }
        case 'removeRemoteVideoTrack': {
            const { id } = action
            return {
                ...prevState,
                remoteVideoTracks: omit(prevState.remoteVideoTracks, id),
            }
        }
        case 'removeRemoteAudioTrack': {
            const { id } = action
            return {
                ...prevState,
                remoteAudioTracks: omit(prevState.remoteAudioTracks, id),
            }
        }
        default:
            throw new Error('Unknown action type')
    }
}

const TrackProvider = ({ children }: { children: React.ReactNode }) => {
    const [state, dispatch] = React.useReducer(reduceTracks, {
        localVideoTracks: {},
        localAudioTracks: {},
        remoteVideoTracks: {},
        remoteAudioTracks: {},
    })

    report(state)

    return (
        <TrackDispatchContext.Provider value={dispatch}>
            <TrackStateContext.Provider value={state}>{children}</TrackStateContext.Provider>
        </TrackDispatchContext.Provider>
    )
}

const useTracks = () => {
    const state = React.useContext(TrackStateContext)
    if (state === undefined) {
        throw new Error('useTracks must be used within a TrackProvider')
    }
    return React.useMemo(() => state, [state])
}
const useDispatchTracks = () => {
    const dispatch = React.useContext(TrackDispatchContext)
    if (dispatch === undefined) {
        throw new Error('useDispatchTracks must be used within a TrackProvider')
    }
    return dispatch
}

export { TrackProvider, useTracks, useDispatchTracks }

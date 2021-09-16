import React, {useState} from "react";


type State = MediaStreamTrack
type Dispatch = React.Dispatch<React.SetStateAction<State>>

const MicrophoneStateContext = React.createContext<State>(null)
const MicrophoneDispatchContext = React.createContext<Dispatch>(null)


const MicrophoneProvider = ({children}: { children: React.ReactNode }) => {
    const [state, dispatch] = useState<MediaStreamTrack>()

    return (
        <MicrophoneStateContext.Provider value={state}>
            <MicrophoneDispatchContext.Provider value={dispatch}>
                {children}
            </MicrophoneDispatchContext.Provider>
        </MicrophoneStateContext.Provider>
    )
}

const useMicrophone = () => {
    const state = React.useContext(MicrophoneStateContext)
    if (state === null)
        throw new Error('Please wrap around your DOM tree with the MicrophoneProvider')
    return state
}

const useMicrophoneDispatch = () => {
    const state = React.useContext(MicrophoneDispatchContext)
    if (state === null)
        throw new Error('Please wrap around your DOM tree with the MicrophoneProvider')
    return state
}

export {MicrophoneProvider, useMicrophone, useMicrophoneDispatch}
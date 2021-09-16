import React, {useState} from "react";


type State = MediaStreamTrack
type Dispatch = React.Dispatch<React.SetStateAction<State>>

const WebcamStateContext = React.createContext<State>(null)
const WebcamDispatchContext = React.createContext<Dispatch>(null)


const WebcamProvider = ({children}: { children: React.ReactNode }) => {
    const [state, dispatch] = useState<MediaStreamTrack>()

    return (
        <WebcamStateContext.Provider value={state}>
            <WebcamDispatchContext.Provider value={dispatch}>
                {children}
            </WebcamDispatchContext.Provider>
        </WebcamStateContext.Provider>
    )
}

const useWebcam = () => {
    const state = React.useContext(WebcamStateContext)
    if (state === null)
        throw new Error('Please wrap around your DOM tree with the WebcamProvider')
    return state
}

const useWebcamDispatch = () => {
    const state = React.useContext(WebcamDispatchContext)
    if (state === null)
        throw new Error('Please wrap around your DOM tree with the WebcamProvider')
    return state
}

export {WebcamProvider, useWebcam, useWebcamDispatch}
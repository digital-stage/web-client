import React, { useContext } from 'react'
import { AudioContextContext, AudioContextContextT } from '../provider/AudioContextProvider'

const useAudioContext = (): AudioContextContextT =>
    useContext<AudioContextContextT>(AudioContextContext)

export default useAudioContext

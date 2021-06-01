import { useEffect, useState } from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'
import useAudioContext from './useAudioContext'

const useAudioOutput = (): void => {
    const localDevice = useStageSelector(
        (state) => state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId]
    )
    const [outputAudioDeviceId, setOutputAudioDeviceId] = useState<string>()
    const { setSinkId } = useAudioContext()

    useEffect(() => {
        setSinkId(outputAudioDeviceId)
    }, [outputAudioDeviceId])

    // HANDLE OUTPUT CHANGE
    useEffect(() => {
        if (localDevice && localDevice.outputAudioDeviceId !== outputAudioDeviceId) {
            setOutputAudioDeviceId(localDevice.outputAudioDeviceId)
        }
    }, [localDevice])
}

export default useAudioOutput

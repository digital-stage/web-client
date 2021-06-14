import { useStageSelector } from '@digitalstage/api-client-react'
import { useEffect } from 'react'
import useAudioContext from '../useAudioContext'
import reduceStageDevicePosition from './reduceStageDevicePosition'

const Listener = (): JSX.Element => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => ready && state.globals.localDeviceId
    )
    const stageDeviceId = useStageSelector<string | undefined>(
        (state) =>
            localDeviceId &&
            state.stageDevices.allIds.find(
                (id) => state.stageDevices.byId[id].deviceId === localDeviceId
            )
    )
    const { position } = reduceStageDevicePosition(stageDeviceId)
    const { audioContext } = useAudioContext()

    useEffect(() => {
        if (audioContext) {
            audioContext.listener.positionX.setValueAtTime(position.x, audioContext.currentTime)
            audioContext.listener.positionY.setValueAtTime(position.y, audioContext.currentTime)
            audioContext.listener.positionZ.setValueAtTime(1, audioContext.currentTime)
            // TODO: Calculate rotation into vector
            audioContext.listener.forwardZ.setValueAtTime(position.rZ, audioContext.currentTime)
        }
    }, [audioContext, position.x, position.y, position.rZ])

    return null
}
export default Listener

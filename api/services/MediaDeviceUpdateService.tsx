import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import { useEffect } from 'react'
import { refreshMediaDevices } from './MediasoupService/util'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'

const MediaDeviceUpdateService = () => {
    const localDevice = useStageSelector(
        (state) =>
            state.globals.localDeviceId
                ? (state.devices.byId[state.globals.localDeviceId] as BrowserDevice)
                : undefined,
        shallowEqual
    )
    const { emit } = useConnection()

    useEffect(() => {
        if (emit && localDevice?._id) {
            navigator.mediaDevices.ondevicechange = () =>
                refreshMediaDevices(
                    localDevice._id,
                    localDevice.inputAudioDevices,
                    localDevice.inputVideoDevices,
                    localDevice.outputAudioDevices,
                    emit
                )
            return () => {
                navigator.mediaDevices.ondevicechange = undefined
            }
        }
    }, [
        emit,
        localDevice?._id,
        localDevice?.inputAudioDevices,
        localDevice?.inputVideoDevices,
        localDevice?.outputAudioDevices,
    ])

    return null
}
export default MediaDeviceUpdateService

import MediasoupService from './MediasoupService'
import AutoLoginService from './AutoLoginService'
import React from 'react'
import AudioRenderService from './AudioRenderer'
import MediaDeviceUpdateService from './MediaDeviceUpdateService'
import ConnectionService from './ConnectionService'
import WebRTCService from './WebRTCService'

const DigitalStageServices = () => {
    return (
        <>
            <AutoLoginService />
            <ConnectionService />
            <MediaDeviceUpdateService />
            <MediasoupService />
            <WebRTCService />
            <AudioRenderService />
        </>
    )
}
export default DigitalStageServices

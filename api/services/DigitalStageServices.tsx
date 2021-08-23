import MediasoupService from './MediasoupService'
import React from 'react'
import AudioRenderService from './AudioRenderer'
import MediaDeviceUpdateService from './MediaDeviceUpdateService'
import WebRTCService from './WebRTCService'

const DigitalStageServices = () => {
    return (
        <>
            <MediaDeviceUpdateService />
            <MediasoupService />
            <WebRTCService />
            <AudioRenderService />
        </>
    )
}
export default DigitalStageServices

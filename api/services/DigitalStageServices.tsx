import MediasoupService from './MediasoupService'
import AutoLoginService from './AutoLoginService'
import React from 'react'
import AudioRenderService from './AudioRenderer'
import MediaDeviceUpdateService from './MediaDeviceUpdateService'
import ConnectionService from './ConnectionService'

const DigitalStageServices = () => {
    if (process.browser) {
        return (
            <>
                <AutoLoginService />
                <ConnectionService />
                <MediaDeviceUpdateService />
                <MediasoupService />
                <AudioRenderService />
            </>
        )
    }
    return null
}
export default DigitalStageServices

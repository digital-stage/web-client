import MediasoupService from './MediasoupService'
import AutoLoginService from './AutoLoginService'
import React from 'react'
import AudioRenderService from './AudioRenderer'
import MediaDeviceUpdateService from './MediaDeviceUpdateService'

const DigitalStageServices = () => {
    if (process.browser) {
        return (
            <>
                <AutoLoginService />
                <MediaDeviceUpdateService />
                <MediasoupService />
                <AudioRenderService />
            </>
        )
    }
    return null
}
export default DigitalStageServices

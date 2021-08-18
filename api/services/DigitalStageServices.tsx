import MediasoupService from './MediasoupService'
import AutoLoginService from './AutoLoginService'
import React from 'react'
import AudioRenderService from './AudioRenderer'

const DigitalStageServices = () => {
    return (
        <>
            <AutoLoginService />
            {process.browser ? <MediasoupService /> : null}
            <AudioRenderService />
        </>
    )
}
export default DigitalStageServices

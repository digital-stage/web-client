import React from 'react'
import { AudioRenderService } from './AudioRenderer'
import { MediaDeviceUpdateService } from './MediaDeviceUpdateService'
import { AutoLoginService } from './AutoLoginService'
import { MediasoupService } from './MediasoupService'
import { WebRTCService } from './WebRTCService'

import { ConnectionService } from './ConnectionService'
import { trace } from '../logger'

const report = trace('DigitalStageServices')

const DigitalStageServices = () => {
    report('RERENDER')
    return (
        <>
            <ConnectionService />
            <AutoLoginService />
            <MediaDeviceUpdateService />
            <AudioRenderService />
            <MediasoupService />
            <WebRTCService />
        </>
    )
}
export { DigitalStageServices }

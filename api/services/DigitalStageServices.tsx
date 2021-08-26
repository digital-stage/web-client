import React from 'react'
import { AudioRenderService } from './AudioRenderer'
import { MediaDeviceUpdateService } from './MediaDeviceUpdateService'
import { AutoLoginService } from './AutoLoginService'
import debug from 'debug'
import {MediasoupService} from "./MediasoupService";

const report = debug('DigitalStageServices')

const MemorizedAudioLoginService = React.memo(AutoLoginService)
const MemorizedMediaDeviceUpdateService = React.memo(MediaDeviceUpdateService)
const MemorizedAudioRenderService = React.memo(AudioRenderService)
const MemorizedMediasoupService = React.memo(MediasoupService)
//const MemorizedWebRTCService = React.memo(WebRTCService)

const DigitalStageServices = () => {
    report('RERENDER')
    return (
        <>
            <MemorizedAudioLoginService />
            <MemorizedMediaDeviceUpdateService />
            <MemorizedAudioRenderService />
            <MemorizedMediasoupService />
        </>
    )
}
export { DigitalStageServices }

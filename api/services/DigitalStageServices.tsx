import React from 'react'
import { AudioRenderService } from './AudioRenderer'
import { MediaDeviceUpdateService } from './MediaDeviceUpdateService'
import { AutoLoginService } from './AutoLoginService'
import { MediasoupService } from './MediasoupService'
import { WebRTCService } from './WebRTCService'
import debug from 'debug'
import { ConnectionService } from './ConnectionService'

const report = debug('DigitalStageServices')

const MemoizedConnectionService = React.memo(ConnectionService)
const MemoizedAudioLoginService = React.memo(AutoLoginService)
const MemoizedMediaDeviceUpdateService = React.memo(MediaDeviceUpdateService)
const MemoizedAudioRenderService = React.memo(AudioRenderService)
const MemoizedMediasoupService = React.memo(MediasoupService)
const MemoizedWebRTCService = React.memo(WebRTCService)

const DigitalStageServices = () => {
    report('RERENDER')
    return (
        <>
            <MemoizedConnectionService />
            <MemoizedAudioLoginService />
            <MemoizedMediaDeviceUpdateService />
            <MemoizedAudioRenderService />
            <MemoizedMediasoupService />
            <MemoizedWebRTCService />
        </>
    )
}
export { DigitalStageServices }

import React from 'react'
import {AudioRenderService} from './AudioRenderer'
import {AutoLoginService} from './AutoLoginService'
import {MediasoupService} from './MediasoupService'
import {WebRTCService} from './WebRTCService'

import {ConnectionService} from './ConnectionService'
import {AudioContextService} from "./AudioContextService";
import {TemporaryLogger} from "./TemporaryLogger";
import {MediaCaptureService} from "./MediaCaptureService";


const DigitalStageServices = () => {
    return (
        <>
            <ConnectionService/>
            <AutoLoginService/>
            <MediaCaptureService/>
            <AudioContextService/>
            <AudioRenderService/>
            <MediasoupService/>
            <WebRTCService/>
            <TemporaryLogger/>
        </>
    )
}
export {DigitalStageServices}

import React from 'react'
import {AudioRenderService} from './AudioRenderer/old'
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

const MemoizedDigitalStageServices = React.memo(DigitalStageServices)

export {MemoizedDigitalStageServices as DigitalStageServices}

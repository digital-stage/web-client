import React from 'react'
import {AudioRenderService} from './AudioRenderer'
import {MediaDeviceUpdateService} from './MediaDeviceUpdateService'
import {AutoLoginService} from './AutoLoginService'
import {MediasoupService} from './MediasoupService'
import {WebRTCService} from './WebRTCService'

import {ConnectionService} from './ConnectionService'
import {AudioContextService} from "./AudioContextService";
import {TemporaryLogger} from "./TemporaryLogger";


const DigitalStageServices = () => {
  return (
    <>
      <ConnectionService/>
      <AutoLoginService/>
      <MediaDeviceUpdateService/>
      <AudioContextService/>
      <AudioRenderService/>
      <MediasoupService/>
      <WebRTCService/>
      <TemporaryLogger/>
    </>
  )
}
export {DigitalStageServices}

import MediasoupService from './MediasoupService'
import AutoLoginService from './AutoLoginService'
import React from 'react'
import AudioRenderService from './AudioRenderer'

const DigitalStageServices = () => {
  if(process.browser) {
    return (
      <>
        <AutoLoginService />
        <MediasoupService />
        <AudioRenderService />
      </>
    )
  }
  return null
}
export default DigitalStageServices

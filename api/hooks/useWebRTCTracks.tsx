import { useContext } from 'react'
import { WebRTCContext, WebRTCContextT } from '../provider/WebRTCProvider'

const useWebRTCTracks = () => useContext<WebRTCContextT>(WebRTCContext)

export default useWebRTCTracks

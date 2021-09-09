import {
  logger, useAudioConsumers,
  useStageSelector, useVideoConsumers,
  useWebRTCRemoteAudioTracks,
  useWebRTCRemoteVideos
} from "@digitalstage/api-client-react";
import React from "react";

const { trace } = logger('Temporary')

const TemporaryLogger = () => {
  const videoTracks = useStageSelector(state => state.videoTracks.allIds)
  const audioTracks = useStageSelector(state => state.audioTracks.allIds)
  const webRTCVideos = useWebRTCRemoteVideos()
  const webRTCAudioTracks = useWebRTCRemoteAudioTracks()
  const mediasoupVideoConsumers = useVideoConsumers()
  const mediasoupAudioConsumers = useAudioConsumers()

  React.useEffect(() => {
    trace("Video track models changed", videoTracks)
  }, [videoTracks])

  React.useEffect(() => {
    trace("Audio track models changed", audioTracks)
  }, [audioTracks])

  React.useEffect(() => {
    trace("WebRTC video track list changed", webRTCVideos)
  }, [webRTCVideos])

  React.useEffect(() => {
    trace("WebRTC audio track list changed", webRTCAudioTracks)
  }, [webRTCAudioTracks])

  React.useEffect(() => {
    trace("Mediasoup video consumer list changed", mediasoupVideoConsumers)
  }, [mediasoupVideoConsumers])

  React.useEffect(() => {
    trace("Mediasoup audio consumer list changed", mediasoupAudioConsumers)
  }, [mediasoupAudioConsumers])

  return null
}
export {TemporaryLogger}
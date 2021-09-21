/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { logger } from "../logger";
import { useStageSelector } from "../redux/selectors/useStageSelector";
import React from "react";
import {useAudioConsumers, useVideoConsumers } from "./MediasoupService";
import {useWebRTCRemoteAudioTracks, useWebRTCRemoteVideos } from "./WebRTCService";

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
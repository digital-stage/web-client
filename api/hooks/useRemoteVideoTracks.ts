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

import {useStageSelector} from "../redux/selectors/useStageSelector";
import {useConsumers} from "../services/MediasoupService";
import {useWebRTCRemoteVideos} from "../services/WebRTCService";

/*
const useRemoteVideoStreamTracks = (stageMemberId: string): MediaStreamTrack[] => {
  const webRTCVideos = useWebRTCRemoteVideos()
  const stageDeviceIds = useStageSelector(state => state.stageDevices.byStageMember[stageMemberId] || [])
  const videoTrackIds = useStageSelector(state => state.videoTracks.byStageMember[stageMemberId] || [])
  const mediasoupConsumers = useConsumers()
  return React.useMemo<MediaStreamTrack[]>(() => {
    return [
      ...stageDeviceIds.reduce((prev, stageDeviceId) => {
        if (webRTCVideos[stageDeviceId]) {
          return [...prev, webRTCVideos[stageDeviceId]]
        }
        return prev
      }, []),
      ...videoTrackIds.reduce((prev, videoTrackId) => {
        if (mediasoupConsumers[videoTrackId]) {
          return [...prev, mediasoupConsumers[videoTrackId].track]
        }
        return prev
      }, [])
    ]
  }, [mediasoupConsumers, stageDeviceIds, videoTrackIds, webRTCVideos])
}*/

export type RemoteVideoTracks = {
  [videoTrackId: string]: MediaStreamTrack
}

const useRemoteVideoTracks = (stageMemberId: string): RemoteVideoTracks => {
  const webRTCVideos = useWebRTCRemoteVideos()
  const mediasoupConsumers = useConsumers()
  const videoTracks = useStageSelector(state => state.videoTracks.byStageMember[stageMemberId]?.map(id => {
    const {_id, type, producerId, stageDeviceId} = state.videoTracks.byId[id]
    return {_id, type, producerId, stageDeviceId}
  }) || [])
  //TODO: Discuss if we should wrap this with React.useMemo ...
  return videoTracks.reduce<RemoteVideoTracks>((prev, {_id, type, producerId, stageDeviceId}) => {
    if (type === "mediasoup") {
      if (mediasoupConsumers[producerId]) {
        return {
          ...prev,
          [_id]: mediasoupConsumers[producerId].track
        }
      }
    } else if (type === "browser") {
      if (webRTCVideos[stageDeviceId]) {
        return {
          ...prev,
          [_id]: webRTCVideos[stageDeviceId]
        }
      }
    }
    return prev
  }, {})
}

export {useRemoteVideoTracks}
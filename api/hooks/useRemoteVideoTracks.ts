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

import {RootState, useTrackedSelector} from "@digitalstage/api-client-react";
import {useConsumers} from "../services/MediasoupService";
import {useWebRTCRemoteVideos} from "../services/WebRTCService";

export type RemoteVideoTracks = {
  [videoTrackId: string]: MediaStreamTrack
}

const selectRemoteVideoTracks = (state: RootState, stageMemberId?: string): {
  _id: string,
  type: string,
  producerId?: string,
  stageDeviceId: string
}[] => stageMemberId && state.videoTracks.byStageMember[stageMemberId]?.map(id => {
  const {_id, type, producerId, stageDeviceId} = state.videoTracks.byId[id]
  return {_id, type, producerId, stageDeviceId}
}) || []

const useRemoteVideoTracks = (stageMemberId?: string): RemoteVideoTracks => {
  const webRTCVideos = useWebRTCRemoteVideos()
  const mediasoupConsumers = useConsumers()
  const state = useTrackedSelector()
  const videoTracks = selectRemoteVideoTracks(state, stageMemberId)
  return videoTracks.reduce<RemoteVideoTracks>((prev, {_id, type, stageDeviceId}) => {
    if (type === "mediasoup") {
      if (mediasoupConsumers[_id]) {
        return {
          ...prev,
          [_id]: mediasoupConsumers[_id].track
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
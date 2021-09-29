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
import {useAudioConsumers} from "../services/MediasoupService";
import {useWebRTCRemoteAudioTracks} from "../services/WebRTCService";
import React from "react";

export type RemoteAudioTracks = {
    [audioTrackId: string]: MediaStreamTrack
}

const useRemoteAudioTracks = (stageDeviceId: string): RemoteAudioTracks => {
    // There should be only one audio track for each webrtc or mediasoup per stage device
    const webRTCAudioTrackId = useStageSelector(state => state.audioTracks
        .byStageDevice[stageDeviceId]?.find(id => state.audioTracks.byId[id].type === "browser"))
    const mediasoupAudioTrackId = useStageSelector(state => state.audioTracks
        .byStageDevice[stageDeviceId]?.find(id => state.audioTracks.byId[id].type === "mediasoup"))

    const webRTCAudioTracks = useWebRTCRemoteAudioTracks()
    const mediasoupAudioConsumers = useAudioConsumers()

    return React.useMemo(() => {
        let tracks = {}
        if(webRTCAudioTracks[stageDeviceId]) {
            if(webRTCAudioTrackId) {
                tracks = {
                    ...tracks,
                    [webRTCAudioTrackId]: webRTCAudioTracks[stageDeviceId]
                }
            } else {
                console.error("Could not find audio track model for WebRTC audio track " + webRTCAudioTracks[stageDeviceId].id)
            }
        }
        if(mediasoupAudioConsumers[mediasoupAudioTrackId]) {
            tracks = {
                ...tracks,
                [mediasoupAudioTrackId]: mediasoupAudioConsumers[mediasoupAudioTrackId].track
            }
        }
        return tracks
    }, [mediasoupAudioConsumers, mediasoupAudioTrackId, stageDeviceId, webRTCAudioTrackId, webRTCAudioTracks])
}

export {useRemoteAudioTracks}
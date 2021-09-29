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

import {VideoPlayer} from "./VideoPlayer";
import {Avatar} from "./Avatar";
import {ConductorButton} from "./ConductorButton";
import React from "react";
import {useWebRTCStats} from "@digitalstage/api-client-react";
import { AiOutlineAudioMuted } from "react-icons/ai";


const TrackStatsView = ({trackId}: { trackId: string }): JSX.Element => {
  const stats = useWebRTCStats(trackId)
  if (stats) {
    return (
      <span className="stats">
                {stats.roundTripTime ? <span>{`RTT ${stats.roundTripTime}ms`}</span> : null}
        {stats.jitter ? <span>{`Jitter ${stats.jitter}%/s`}</span> : null}
        {stats.jitterBufferDelay ? (
          <span>{`Jitterbuffer ${stats.jitterBufferDelay}ms`}</span>
        ) : null}
            </span>
    )
  }
  return null
}

const StageMemberBox = ({
                          userName,
                          groupName,
                          groupColor,
                          active,
                          track,
                          conductorId,
  muted
                        }: {
  userName: string
  groupName?: string
  groupColor?: string
  active?: boolean
  track?: MediaStreamTrack
  conductorId?: string
  muted: boolean
}): JSX.Element => {
  const [videoMuted, setVideoMuted] = React.useState<boolean>(track?.muted)
  React.useEffect(() => {
    if(track) {
      const onMute = () => setVideoMuted(true)
      const onUnmute = () => setVideoMuted(false)
      track.addEventListener("mute", onMute)
      track.addEventListener("unmute", onUnmute)
      return () => {
        track.removeEventListener("mute", onMute)
        track.removeEventListener("unmute", onUnmute)
      }
    }
  }, [track])

  return (
    <div
      className="memberView"
      style={{
        borderColor: groupColor,
      }}
    >
      {track && <VideoPlayer track={track}/>}
      {muted && <span className="muted"><AiOutlineAudioMuted/></span>}
      <div className={`info ${!track ? 'centered' : ''}`}>
        <Avatar name={userName} color={groupColor} active={active}/>
        <div className="names">
          {groupName && (
            <h6
              className="groupName"
              style={{
                color: groupColor,
              }}
            >
              {groupName}
            </h6>
          )}
          <h5 className="memberName">{userName}</h5>
          {videoMuted && <span style={{fontSize: "0.6rem", color: "var(---danger)"}}>(video muted)</span>}
        </div>
        {track && <TrackStatsView trackId={track.id}/>}
      </div>
      {!!conductorId ? <ConductorButton stageMemberId={conductorId}/> : null}
    </div>
  )
}
export {StageMemberBox}
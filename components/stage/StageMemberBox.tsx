import {VideoPlayer} from "./VideoPlayer";
import {Avatar} from "./Avatar";
import {ConductorButton} from "./ConductorButton";
import React from "react";
import {useWebRTCStats} from "@digitalstage/api-client-react";


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
                        }: {
  userName: string
  groupName?: string
  groupColor?: string
  active?: boolean
  track?: MediaStreamTrack
  conductorId?: string
}): JSX.Element => {
  return (
    <div
      className="memberView"
      style={{
        borderColor: groupColor,
      }}
    >
      {track ? <VideoPlayer track={track}/> : null}
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
          {!!track && track.muted && <span style={{fontSize: "0.6rem", color: "var(---danger)"}}>(muted)</span>}
        </div>
        {track ? <TrackStatsView trackId={track.id}/> : null}
      </div>
      {!!conductorId ? <ConductorButton stageMemberId={conductorId}/> : null}
    </div>
  )
}
export {StageMemberBox}
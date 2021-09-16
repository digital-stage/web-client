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
  const [muted, setMuted] = React.useState<boolean>(track?.muted)
  React.useEffect(() => {
    if(track) {
      const onMute = () => setMuted(true)
      const onUnmute = () => setMuted(false)
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
          {muted && <span style={{fontSize: "0.6rem", color: "var(---danger)"}}>(muted)</span>}
        </div>
        {track && <TrackStatsView trackId={track.id}/>}
      </div>
      {!!conductorId ? <ConductorButton stageMemberId={conductorId}/> : null}
    </div>
  )
}
export {StageMemberBox}
import {
  useEmit, useLocalDeviceId, useRemoteVideoTracks,
  useShowLanes,
  useShowOffline,
  useStageSelector, useWebcam
} from "@digitalstage/api-client-react";
import React from "react";
import {HiFilter, HiOutlineFilter} from "react-icons/hi";
import Image from "next/image";
import portraitIcon from "../../public/icons/portrait.svg";
import landscapeIcon from "../../public/icons/landscape.svg";
import {useFilteredStageMembersByGroup} from "../../api/hooks/useFilteredStageMembers";
import {FaMusic} from "react-icons/fa";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {VideoPlayer} from "./VideoPlayer";
import {AiOutlineAudioMuted} from "react-icons/ai";
import {Avatar} from "./Avatar";

const useNumCols = (): number => useStageSelector<number>(state => state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].numCols || 2)


const Box = ({
               name,
               color,
               groupName,
               track,
               videoTrackId,
               online,
               muted
             }: {
  name: string,
  color?: string,
  groupName?: string,
  track?: MediaStreamTrack
  videoTrackId?: string,
  online?: boolean,
  muted?: boolean
}) => {
  const numCols = useNumCols()
  const showLanes = useShowLanes()

  const [videoMuted, setVideoMuted] = React.useState<boolean>(track ? track.muted : false)
  React.useEffect(() => {
    if (track) {
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

  const width = showLanes
    ? `calc(${Math.floor((1000 / numCols) * 100) / 1000}vw - var(--sidebar-width) / ${numCols})`
    : `${Math.floor((1000 / numCols) * 100) / 1000}%`
  const height = showLanes ? '100%' : 'auto'
  return (
    <>
      <div className="box" style={{
        width: width,
        flexBasis: width,
        height: height,
      }}>
        <div className="ratio" style={{
          paddingTop: showLanes ? 0 : '56.25%',
          height: height,
        }}>
          <div className="inner">
            {track && <VideoPlayer track={track}/>}
            {muted && <span className="muted"><AiOutlineAudioMuted/></span>}
            <div className={`info ${!track ? 'centered' : ''}`}>
              {name && <Avatar name={name} color={color} active={online}/>}
              <div className="names">
                {groupName && (
                  <h6
                    className="groupName"
                    style={{
                      color: color,
                    }}
                  >
                    {groupName}
                  </h6>
                )}
                {name && <h5 className="memberName">{name}</h5>}
                {videoMuted &&
                <span style={{fontSize: "0.6rem", color: "var(---danger)"}}>Schlechte Internetverbindung</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const LocalStageMemberView = ({color, groupName}: { color?: string, groupName?: string }): JSX.Element | null => {
  const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
  const userName = useStageSelector<string>(state => state.globals.localUserId && state.users.byId[state.globals.localUserId]?.name || "Local user")

  // Gather all tracks together
  const remoteTracks = useRemoteVideoTracks(localStageMemberId)
  const localTrack = useWebcam()
  const videoTrackId = useStageSelector<string | undefined>(state =>
    state.globals.localStageDeviceId &&
    state.videoTracks.byStageDevice[state.globals.localStageDeviceId] &&
    state.videoTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0
      ? state.videoTracks.byStageDevice[state.globals.localStageDeviceId][0]
      : undefined)
  const hasAudioTracks = useStageSelector<boolean>(state => state.globals.localStageDeviceId && state.audioTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0 || false)

  return (
    <>
      <Box
        key={videoTrackId}
        name={userName}
        groupName={groupName}
        color={color}
        track={localTrack}
        videoTrackId={videoTrackId}
        muted={!hasAudioTracks}
        online={true}
      />
      {Object.keys(remoteTracks).map(videoTrackId =>
        <Box
          key={videoTrackId}
          name={userName}
          groupName={groupName}
          color={color}
          muted={!hasAudioTracks}
          online={true}
        />
      )}
    </>
  )
}
const RemoteStageMemberView = ({
                                 stageMemberId,
                                 color, groupName
                               }: { stageMemberId: string, color?: string, groupName?: string }): JSX.Element => {
  const online = useStageSelector<boolean>(state => state.stageMembers.byId[stageMemberId].active)
  const userName = useStageSelector<string>(state => state.stageMembers.byId[stageMemberId].userId && state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name || stageMemberId)
  const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageMember[stageMemberId] && state.audioTracks.byStageMember[stageMemberId].length > 0)
  const videoTracks = useRemoteVideoTracks(stageMemberId)

  if (Object.keys(videoTracks).length > 0) {
    return (
      <>
        {Object.keys(videoTracks).map(videoTrackId => (
          <Box
            key={videoTrackId}
            name={userName}
            color={color}
            videoTrackId={videoTrackId}
            track={videoTracks[videoTrackId]}
            muted={!hasAudioTracks}
            groupName={groupName}
            online={online}
          />
        ))}
      </>
    )
  }

  return (
    <Box
      name={userName}
      color={color}
      groupName={groupName}
      online={online}
      muted={!hasAudioTracks}
    />
  )
}

const StageMemberView = ({
                           stageMemberId,
                           color,
                           groupName
                         }: { stageMemberId: string, color?: string, groupName?: string }): JSX.Element => {
  const isLocal = useStageSelector<boolean>(state => state.globals.stageMemberId === stageMemberId)
  if (isLocal) {
    return <LocalStageMemberView color={color} groupName={groupName}/>
  }
  return <RemoteStageMemberView stageMemberId={stageMemberId} color={color} groupName={groupName}/>
}

const GroupView = ({groupId, isOnlyGroup}: { groupId: string, isOnlyGroup?: boolean }): JSX.Element | null => {
  const name = useStageSelector(state => state.groups.byId[groupId].name)
  const color = useStageSelector(state => state.groups.byId[groupId].color)
  const sortedStageMemberIds = useFilteredStageMembersByGroup(groupId)
  const showLanes = useShowLanes()

  if (sortedStageMemberIds.length > 0) {
    return (
      <>
        <div className={`group${showLanes ? ' lanes' : ''}`} style={{
          borderWidth: isOnlyGroup ? 0 : undefined,
          borderColor: isOnlyGroup ? 'transparent' : color,
        }}>
          {sortedStageMemberIds.map(stageMemberId => <StageMemberView key={stageMemberId}
                                                                      color={!isOnlyGroup ? color : undefined}
                                                                      stageMemberId={stageMemberId}
                                                                      groupName={name}
          />)}
          {isOnlyGroup && (
            <div className="groupName">
              <div className="groupIcon" style={{
                backgroundColor: color
              }}>
                <FaMusic/>
              </div>
              {name}
            </div>
          )}
        </div>
      </>
    )
  }

  return null
}

const StageView = (): JSX.Element => {
  const emit = useEmit()
  const numCols = useNumCols()
  const showLanes = useShowLanes()
  const showOffline = useShowOffline()
  const localDeviceId = useLocalDeviceId()
  const groupIds = useStageSelector<string[]>(state => state.globals.stageId ? state.groups.byStage[state.globals.stageId] : [])

  const onOfflineToggle = React.useCallback(() => {
    if (emit && localDeviceId)
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        showOffline: !showOffline
      })
  }, [emit, localDeviceId, showOffline])

  const onLaneToggle = React.useCallback(() => {
    if (emit && localDeviceId)
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        showLanes: !showLanes
      })
  }, [emit, localDeviceId, showLanes])

  const increaseCols = React.useCallback(() => {
    if (localDeviceId && emit) {
      const num = numCols + 1
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        numCols: num
      } as ClientDevicePayloads.ChangeDevice)
    }
  }, [emit, localDeviceId, numCols])
  const decreaseCols = React.useCallback(() => {
    if (localDeviceId && emit) {
      const num = Math.max(1, numCols - 1)
      if (num !== numCols) {
        emit(ClientDeviceEvents.ChangeDevice, {
          _id: localDeviceId,
          numCols: num
        } as ClientDevicePayloads.ChangeDevice)
      }
    }
  }, [emit, localDeviceId, numCols])

  return (
    <>
      <div className={`stageGrid${showLanes ? ` lanes` : ''}`}>
        {groupIds.map(groupId => <GroupView key={groupId} groupId={groupId} isOnlyGroup={groupIds.length > 1}/>)}
        <div className="control">
          <button className="round" onClick={onOfflineToggle}>
            {showOffline ? <HiOutlineFilter/> : <HiFilter/>}
          </button>
          <button className="round" onClick={onLaneToggle}>
            {showLanes
              ? (<Image src={portraitIcon} alt="Auf Hochkantdarstellung umschalten"/>)
              : (<Image src={landscapeIcon} alt="Auf Breitbilddarstellung umschalten"/>)}
          </button>
        </div>
        <div className="colControl">
          <button className="small" onClick={increaseCols}>+</button>
          <span>{numCols}</span>
          <button className="small" onClick={decreaseCols}>-</button>
        </div>
      </div>
    </>
  )
}
export {StageView}
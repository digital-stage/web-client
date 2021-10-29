import {
  selectCurrentStageMemberId,
  useRemoteVideoTracks,
  useTrackedSelector,
  useWebcam
,useSelectStageMemberIdsByGroup} from "../../client";
import React from "react";
import {FaMusic} from "react-icons/fa";
import {AiOutlineAudioMuted} from "react-icons/ai";
import {GoSettings} from "react-icons/go";
import {VideoPlayer} from "./VideoPlayer";
import {Avatar} from "./Avatar";
import {SettingsModal} from "./SettingsModal";
import {Heading5, Heading6} from "../../ui/Heading";


const Box = ({
               name,
               color,
               groupName,
               track,
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
  const state = useTrackedSelector()
  const {localDeviceId} = state.globals
  const displayMode = localDeviceId ? state.devices.byId[localDeviceId].displayMode : "boxes"
  const numCols = localDeviceId ?
    displayMode === "lanes"
      ? state.devices.byId[localDeviceId]?.numLanes || 3
      : state.devices.byId[localDeviceId]?.numBoxes || 2
    : 2
  const showLanes = displayMode === "lanes"

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
    ? `calc(${Math.floor((1000 / numCols) * 100) / 1000}vw - 16px - var(--sidebar-width) / ${numCols})`
    : `${Math.floor((1000 / numCols) * 100) / 1000}%`
  const height = showLanes ? '100%' : 'auto'
  return (
    <>
      <div className="box" style={{
        width,
        flexBasis: width,
        height,
      }}>
        <div className="ratio" style={{
          paddingTop: showLanes ? 0 : '56.25%',
          height,
        }}>
          <div className="inner">
            {track && <VideoPlayer track={track}/>}
            {muted && <span className="muted"><AiOutlineAudioMuted/></span>}
            <div className={`info ${!track ? 'centered' : ''}`}>
              {name && <Avatar name={name} color={color} active={online}/>}
              <div className="names">
                {groupName && (
                  <Heading6
                    className="groupName"
                    style={{
                      color,
                    }}
                  >
                    {groupName}
                  </Heading6>
                )}
                {name && <Heading5 className="memberName">{name}</Heading5>}
                {videoMuted &&
                <span style={{
                  fontSize: "0.6rem",
                  color: "var(---danger)"
                }}>Schlechte Internetverbindung</span>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const LocalStageMemberView = ({color, groupName}: { color?: string, groupName?: string }): JSX.Element | null => {
  const state = useTrackedSelector()
  const localStageMemberId = selectCurrentStageMemberId(state)
  const userName = state.globals.localUserId && state.users.byId[state.globals.localUserId]?.name || "Local user"

  // Gather all tracks together
  const remoteTracks = useRemoteVideoTracks(localStageMemberId)
  const localTrack = useWebcam()
  const localVideoTrackId = state.globals.localStageDeviceId &&
  state.videoTracks.byStageDevice[state.globals.localStageDeviceId] &&
  state.videoTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0
    ? state.videoTracks.byStageDevice[state.globals.localStageDeviceId][0]
    : undefined
  const hasAudioTracks = state.globals.localStageDeviceId && state.audioTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0 || false

  return (
    <>
      <Box
        key={localVideoTrackId}
        name={userName}
        groupName={groupName}
        color={color}
        track={localTrack}
        videoTrackId={localVideoTrackId}
        muted={!hasAudioTracks}
        online
      />
      {Object.keys(remoteTracks).map(videoTrackId =>
        <Box
          key={videoTrackId}
          name={userName}
          groupName={groupName}
          color={color}
          videoTrackId={videoTrackId}
          track={remoteTracks[videoTrackId]}
          muted={!hasAudioTracks}
          online
        />
      )}
    </>
  )
}
const RemoteStageMemberView = ({
                                 stageMemberId,
                                 color, groupName
                               }: { stageMemberId: string, color?: string, groupName?: string }): JSX.Element => {
  const state = useTrackedSelector()
  const online = state.stageMembers.byId[stageMemberId].active
  const userName = state.stageMembers.byId[stageMemberId].userId && state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name || stageMemberId
  const hasAudioTracks = state.audioTracks.byStageMember[stageMemberId] && state.audioTracks.byStageMember[stageMemberId].length > 0
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
  const state = useTrackedSelector()
  const isLocal = state.globals.stageMemberId === stageMemberId
  if (isLocal) {
    return <LocalStageMemberView color={color} groupName={groupName}/>
  }
  return <RemoteStageMemberView stageMemberId={stageMemberId} color={color} groupName={groupName}/>
}

const GroupView = ({groupId, isOnlyGroup}: { groupId: string, isOnlyGroup?: boolean }): JSX.Element | null => {
  const state = useTrackedSelector()
  const {name} = state.groups.byId[groupId]
  const {color} = state.groups.byId[groupId]
  const sortedStageMemberIds = useSelectStageMemberIdsByGroup(groupId)
  const showLanes = state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].displayMode === "lanes" || false

  if (sortedStageMemberIds.length > 0) {
    return (
      <>
        <div className={`group${showLanes ? ' lanes' : ''}`}>
          {isOnlyGroup && (
            <div className="groupInfo">
              <div className="groupName" style={{
                borderColor: color
              }}>
                <div className="groupIcon" style={{
                  backgroundColor: color
                }}>
                  <FaMusic/>
                </div>
                <span>
                                {name}
                            </span>
              </div>
            </div>
          )}
          <div className={`groupGrid${isOnlyGroup ? ' single' : ''}`}>
            {sortedStageMemberIds.map(stageMemberId => <StageMemberView key={stageMemberId}
                                                                        color={!isOnlyGroup ? color : undefined}
                                                                        stageMemberId={stageMemberId}
                                                                        groupName={name}
            />)}
          </div>
        </div>
      </>
    )
  }

  return null
}

const UnmemoizedStageView = (): JSX.Element => {
  const state = useTrackedSelector()
  const showLanes = state.globals.localDeviceId && state.devices.byId[state.globals.localDeviceId].displayMode === "lanes" || false

  const groupIds = state.globals.stageId && state.groups.byStage[state.globals.stageId] || []

  const [modalVisible, setModalVisible] = React.useState<boolean>(false)
  const showModal = React.useCallback(() => setModalVisible(true), [])
  const hideModal = React.useCallback(() => setModalVisible(false), [])

  return (
    <>
      <div className={`stageGrid${showLanes ? ` lanes` : ''}`}>
        {groupIds.map(groupId => <GroupView key={groupId} groupId={groupId}
                                            isOnlyGroup={groupIds.length > 1}/>)}
        <div className="control">
          <button className="round" onClick={showModal}>
            <GoSettings/>
          </button>
        </div>
        <SettingsModal open={modalVisible} onClose={hideModal}/>
      </div>
    </>
  )
}
const StageView = React.memo(UnmemoizedStageView)
export {StageView}
import {
  Group,
  StageMember, useMediasoup,
  User,
  useStageSelector,
} from "@digitalstage/api-client-react";
import React from "react";
import SingleVideoPlayer from "../components/ui/media/SingleVideoPlayer";

const StageMemberView = (props: { id: string }) => {
  const {id} = props
  const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
  const remoteUser = useStageSelector<User>((state) => state.remoteUsers.byId[stageMember.userId])
  const videoTrackIds = useStageSelector<string[]>(state => state.videoTracks.byStageMember[id] || [])
  const {videoConsumers} = useMediasoup()
  return (
    <div>
      <h6>
        {remoteUser.name}
      </h6>
      {videoTrackIds.map(videoTrackId => videoConsumers[videoTrackId]).filter(consumer => !!consumer).map(consumer =>
        <SingleVideoPlayer track={consumer.track}
                           width="auto"
                           height="300px"/>)}
    </div>
  )
}


const GroupView = (props:
                     {
                       id: string
                     }
) => {
  const {id} = props
  const group = useStageSelector<Group>((state) => state.groups.byId[id])
  const stageMemberIds = useStageSelector<string[]>(
    (state) => state.stageMembers.byGroup[id] || []
  )
  return (
    <div>
      <h5>
        {group.name}
      </h5>
      {stageMemberIds.map((stageMemberId) => (
        <StageMemberView key={stageMemberId} id={stageMemberId}/>
      ))}
    </div>
  )
}

const Stage = () => {
  const groupIds = useStageSelector<string[]>((state) => state.globals.stageId ? state.groups.byStage[state.globals.stageId] : [])

  return (
    <div>
      {groupIds.map(groupId => <GroupView key={groupId} id={groupId}/>)}
    </div>
  )
}
export default Stage;
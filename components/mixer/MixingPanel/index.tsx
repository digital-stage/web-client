import {StageDevice, StageMember, User, useStageSelector} from "@digitalstage/api-client-react";
import {AudioTrack, Group} from "@digitalstage/api-types";
import styles from "./MixingPanel.module.css"


const AudioTrackPanel = (props: {
  id: string
}) => {
  const {id} = props;
  const audioTrack = useStageSelector<AudioTrack>(state => state.audioTracks.byId[id]);

  return (
    <div>
      {audioTrack._id}

    </div>
  )
}
const StageDevicePanel = (props: {
  id: string
}) => {
  const {id} = props;
  const stageDevice = useStageSelector<StageDevice>(state => state.stageDevices.byId[id]);
  const audioTrackIds = useStageSelector<string[]>(state => state.audioTracks.byStageDevice[id] || []);

  return (
    <div>
      <h5 className={styles.headline}>
        {stageDevice.name || stageDevice.type}
      </h5>

    </div>
  )
}
const StageMemberPanel = (props: {
  id: string
}) => {
  const {id} = props;
  const stageMember = useStageSelector<StageMember | undefined>(state => state.stageMembers.byId[id]);
  const user = useStageSelector<User | undefined>(state => stageMember && state.remoteUsers.byId[stageMember.userId])
  const stageDeviceIds = useStageSelector<string[]>(state => state.stageDevices.byStageMember[id] || []);

  return (
    <div>
      <h5 className={styles.headline}>
        {user?.name || stageMember._id}
      </h5>
      {stageDeviceIds.map(stageDeviceId => <StageDevicePanel id={stageDeviceId}/>)}
    </div>
  )
}
const GroupPanel = (props: {
  id: string
}) => {
  const {id} = props;
  const group = useStageSelector<Group>(state => state.groups.byId[id]);
  const stageMemberIds = useStageSelector<string[]>(state => state.stageMembers.byGroup[id] || []);

  return (
    <div>
      <h5 className={styles.headline}>
        {group.name}
      </h5>
      <div className={styles.row}>
        {stageMemberIds.map(stageMemberId => <StageMemberPanel id={stageMemberId}/>)}
      </div>
    </div>
  )
}

const MixingPanel = () => {
  const isInsideStage = useStageSelector<boolean>(state => !!state.globals.stageId)

  const groupIds = useStageSelector<string[]>(state => state.groups.allIds)

  if (isInsideStage) {
    return (
      <div className={styles.column}>
        <div className={styles.row}>
          {groupIds.map(groupId => <GroupPanel id={groupId}/>)}
        </div>
      </div>
    )
  }
  return null;
}
export default MixingPanel

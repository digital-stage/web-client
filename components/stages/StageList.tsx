import {StageMember, useConnection, User, useStageSelector} from "@digitalstage/api-client-react";
import {ClientDeviceEvents, ClientDevicePayloads, Group, Stage} from "@digitalstage/api-types";
import styles from './StageList.module.css'
import DangerButton from "../../ui/button/DangerButton";

const StageMemberRow = (props: {
  id: string,
  stage: Stage
}) => {
  const {id, stage} = props;
  const stageMember = useStageSelector<StageMember>(state => state.stageMembers.byId[id])
  const user = useStageSelector<User>(state => state.remoteUsers.byId[stageMember.userId])
  const connection = useConnection()
  const isSoundEditor = stage.soundEditors.some(editor => editor === user._id)
  const isAdmin = stage.admins.some(admin => admin === user._id)

  return (
    <div>
      {user.name}
      {isAdmin && (
        <>

          <label>
            <input type="checkbox" checked={isSoundEditor} onChange={() => {
              if (isSoundEditor) {
                connection.emit(ClientDeviceEvents.ChangeStage, {
                  _id: stage._id,
                  soundEditors: stage.soundEditors.filter(editor => editor !== user._id)
                })
              } else {
                connection.emit(ClientDeviceEvents.ChangeStage, {
                  _id: stage._id,
                  soundEditors: [stage.soundEditors, user._id]
                } as ClientDevicePayloads.ChangeStage)
              }
            }}/>
            Sound editor
          </label>
          <label>
            <input type="checkbox"
                   disabled={stage.admins.length === 1}
                   checked={isAdmin}
                   onChange={() => {
                     if (isAdmin && stage.admins.length > 1) {
                       connection.emit(ClientDeviceEvents.ChangeStage, {
                         _id: stage._id,
                         admins: stage.admins.filter(editor => editor !== user._id)
                       })
                     } else {
                       connection.emit(ClientDeviceEvents.ChangeStage, {
                         _id: stage._id,
                         admins: [stage.admins, user._id]
                       } as ClientDevicePayloads.ChangeStage)
                     }
                   }}/>
            Stage administrator
          </label>
          <DangerButton onClick={() => connection.emit(ClientDeviceEvents.RemoveStageMember, id)}>
            Kick
          </DangerButton>
        </>
      )}
    </div>
  )
}
const GroupRow = (props: {
  id: string
  stage: Stage
}) => {
  const {id, stage} = props;
  const group = useStageSelector<Group>(state => state.groups.byId[id])
  const stageMemberIds = useStageSelector<string[]>(state => state.stageMembers.byGroup[id] || [])

  return (
    <div>
      {group.name}
      {stageMemberIds.map(stageMemberId =>
        <StageMemberRow id={stageMemberId} stage={stage}/>)}
    </div>
  )
}
const StageView = () => {
  const stage = useStageSelector<Stage | undefined>(state => state.globals.stageId && state.stages.byId[state.globals.stageId])
  const groupIds = useStageSelector<string[]>(state => stage && state.groups.byStage[stage._id])

  return (
    <div>
      {stage.name}
      <div>
        {groupIds.map(groupId => <GroupRow key={groupId} id={groupId} stage={stage}/>)}
      </div>
    </div>
  )
}

const StageList = () => {
  const stage = useStageSelector<Stage | undefined>(state => state.globals.stageId && state.stages.byId[state.globals.stageId])
  const groupIds = useStageSelector<string[]>(state => stage && state.groups.byStage[stage._id])

  if (stage) {
    return (
      <div className={styles.wrapper}>
        <h3>Aktuelle Bühne</h3>
        <h2>{stage.name}</h2>
        <StageView  />
      </div>
    )
  }
  return null;
}
export default StageList
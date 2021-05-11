import {useStageSelector} from "@digitalstage/api-client-react";
import {Group, Stage} from "@digitalstage/api-types";
import styles from './StageList.module.css'
import Panel from "../../ui/surface/Panel";

const StageMemberItem = (props: {
  id: string
}) => {
  return (
    <ul className={styles.list}>
      <li className={styles.listItem}>

      </li>
    </ul>
  )
}
const GroupItem = (props: {
  id: string
}) => {
  const {id} = props
  const group = useStageSelector<Group>(state => state.groups.byId[id])
  return (
    <li className={styles.group}>
      {group.name}
    </li>
  )
}

const StageList = () => {
  const stage = useStageSelector<Stage | undefined>(state => state.globals.stageId && state.stages.byId[state.globals.stageId])
  const groupIds = useStageSelector<string[]>(state => stage && state.groups.byStage[stage._id])

  if( stage ) {
    return (
      <div className={styles.wrapper}>
        <h3>Aktuelle Bühne</h3>
        <h2>{stage.name}</h2>
        <div className={styles.list}>
          <div className={styles.groupItem}>
            GRUPPE
          </div>

        </div>
        {groupIds.map(groupId => <GroupItem id={groupId}/>)}
      </div>
    )
  }
  return null;
}
export default StageList
import React from 'react'
import styles from './StageView.module.scss'
import { useStageSelector } from '@digitalstage/api-client-react'
import MemberView from './MemberView'

const GroupView = ({ groupId, hasAdminRights }: { groupId: string; hasAdminRights: boolean }) => {
    const { name, color } = useStageSelector((state) => state.groups.byId[groupId])
    const memberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[groupId] || []
    )

    return (
        <>
            {memberIds.map((memberId) => (
                <MemberView
                    key={memberId}
                    memberId={memberId}
                    groupName={name}
                    groupColor={color}
                    hasAdminRights={hasAdminRights}
                />
            ))}
        </>
    )
}

const MembersGrid = ({
    stageId,
    showLanes,
    hasAdminRights,
}: {
    stageId: string
    showLanes: boolean
    hasAdminRights: boolean
}) => {
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId] || [])
    const conductors = useStageSelector<string[]>((state) =>
        !hasAdminRights
            ? state.stageMembers.byStage[stageId].filter(
                  (id) => state.stageMembers.byId[id].isDirector
              )
            : []
    )

    return (
        <div className={`${styles.membersGrid} ${showLanes ? styles.lanes : ''}`}>
            {conductors.length > 0
                ? conductors.map((memberId) => (
                      <MemberView
                          key={memberId}
                          memberId={memberId}
                          groupColor="transparent"
                          groupName="Conductor"
                          hasAdminRights={false}
                      />
                  ))
                : groupIds.map((groupId) => (
                      <GroupView key={groupId} groupId={groupId} hasAdminRights={hasAdminRights} />
                  ))}
            {}
        </div>
    )
}
export default MembersGrid

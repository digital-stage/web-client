import React from 'react'
import styles from './StageView.module.scss'
import { useStageSelector } from '@digitalstage/api-client-react'
import MemberView from './MemberView'
import Panel from 'ui/Panel'

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

const ConductorOverlay = ({ stageId }: { stageId: string }) => {
    const conductorIds = useStageSelector<string[]>((state) =>
        state.stageMembers.byStage[stageId].filter((id) => state.stageMembers.byId[id].isDirector)
    )

    if (conductorIds.length > 0) {
        return (
            <div className={styles.conductorView}>
                <Panel kind="black">
                    <div className={styles.membersGrid}>
                        {conductorIds.map((conductorId) => (
                            <MemberView key={conductorId} memberId={conductorId} />
                        ))}
                    </div>
                </Panel>
            </div>
        )
    }
    return null
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

    console.log('STAGEVIEW Have ' + groupIds.length + ' groups')

    return (
        <div className={`${styles.membersGrid} ${showLanes ? styles.lanes : ''}`}>
            {groupIds.map((groupId) => (
                <GroupView key={groupId} groupId={groupId} hasAdminRights={hasAdminRights} />
            ))}
            {!hasAdminRights ? <ConductorOverlay stageId={stageId} /> : null}
        </div>
    )
}
export default MembersGrid

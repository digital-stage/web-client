import React from 'react'
import styles from './StageView.module.scss'
import { useStageSelector } from '@digitalstage/api-client-react'
import { MemberView } from './MemberView'
import Panel from 'ui/Panel'

const GroupView = ({
    groupId,
    hasCurrentUserAdminRights,
}: {
    groupId: string
    hasCurrentUserAdminRights: boolean
}) => {
    const { name, color } = useStageSelector((state) => state.groups.byId[groupId])
    const stageMemberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[groupId] || []
    )

    return (
        <>
            {stageMemberIds.map((stageMemberId) => (
                <MemberView
                    key={stageMemberId}
                    stageMemberId={stageMemberId}
                    groupName={name}
                    groupColor={color}
                    hasCurrentUserAdminRights={hasCurrentUserAdminRights}
                />
            ))}
        </>
    )
}
const MemoizedGroupView = React.memo(GroupView)

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
                            <MemberView key={conductorId} stageMemberId={conductorId} />
                        ))}
                    </div>
                </Panel>
            </div>
        )
    }
    return null
}
const MemoizedConductorOverlay = React.memo(ConductorOverlay)

const MembersGrid = ({
    stageId,
    showLanes,
    hasCurrentUserAdminRights,
}: {
    stageId: string
    showLanes: boolean
    hasCurrentUserAdminRights: boolean
}) => {
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId] || [])

    return (
        <div className={`${styles.membersGrid} ${showLanes ? styles.lanes : ''}`}>
            {groupIds.map((groupId) => (
                <MemoizedGroupView
                    key={groupId}
                    groupId={groupId}
                    hasCurrentUserAdminRights={hasCurrentUserAdminRights}
                />
            ))}
            {!hasCurrentUserAdminRights ? <MemoizedConductorOverlay stageId={stageId} /> : null}
        </div>
    )
}
export { MembersGrid }

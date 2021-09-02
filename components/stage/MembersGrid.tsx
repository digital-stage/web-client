import React from 'react'
import styles from './StageView.module.scss'
import { useStageSelector } from '@digitalstage/api-client-react'
import { MemberView } from './MemberView'
import { ConductorOverlay } from './ConductorOverlay'

const GroupView = ({ groupId }: { groupId: string }) => {
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
                />
            ))}
        </>
    )
}
const MemoizedGroupView = React.memo(GroupView)

const MembersGrid = ({ stageId, showLanes }: { stageId: string; showLanes: boolean }) => {
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId] || [])

    return (
        <div className={`${styles.membersGrid} ${showLanes ? styles.lanes : ''}`}>
            {groupIds.map((groupId) => (
                <MemoizedGroupView key={groupId} groupId={groupId} />
            ))}
            <ConductorOverlay stageId={stageId} />
        </div>
    )
}
export { MembersGrid }

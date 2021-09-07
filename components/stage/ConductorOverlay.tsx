import { useCurrentStageAdminSelector, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { Panel } from 'ui/Panel'
import { MemberView } from './MemberView'

const ConductorOverlayCompo = ({ stageId }: { stageId: string }) => {
    const isStageAdmin = useCurrentStageAdminSelector()
    const conductorIds = useStageSelector<string[]>((state) =>
        state.stageMembers.byStage[stageId].filter((id) => state.stageMembers.byId[id].isDirector)
    )

    if (!isStageAdmin && conductorIds.length > 0) {
        return (
            <div className="conductorView">
                <Panel kind="black">
                    <div className="membersGrid">
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
const ConductorOverlay = React.memo(ConductorOverlayCompo)
export { ConductorOverlay }

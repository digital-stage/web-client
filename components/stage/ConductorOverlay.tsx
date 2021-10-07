/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useCurrentStageAdminSelector, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { Panel } from 'ui/Panel'
import { StageMemberView } from './StageMemberView'

const ConductorOverlayCompo = () => {
    const isStageAdmin = useCurrentStageAdminSelector()
    const conductorIds = useStageSelector<string[]>((state) =>
      state.globals.stageId && state.stageMembers.byStage[state.globals.stageId]?.filter((id) => state.stageMembers.byId[id].isDirector) || []
    )
    const showLanes = useStageSelector<boolean>(state => !!state.globals.showLanes)

    if (!isStageAdmin && conductorIds.length > 0) {
        return (
            <div className="conductorView">
                <Panel kind="black">
                    <div className={`membersGrid ${showLanes ? 'lanes' : ''}`}>
                        {conductorIds.map((conductorId) => (
                            <StageMemberView key={conductorId} stageMemberId={conductorId} />
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

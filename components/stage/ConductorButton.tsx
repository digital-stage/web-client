import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents } from '@digitalstage/api-types'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import React, { useCallback } from 'react'

const ConductorButton = ({ stageMemberId }: { stageMemberId: string }) => {
    const emit = useEmit()
    const isDirector = useStageSelector(
        (state) => state.stageMembers.byId[stageMemberId].isDirector
    )
    const handleClick = useCallback(() => {
        emit(ClientDeviceEvents.ChangeStageMember, {
            _id: stageMemberId,
            isDirector: !isDirector,
        })
    }, [emit, isDirector, stageMemberId])
    return (
        <button onClick={handleClick} className={`round minimal conductorToggle`}>
            {isDirector ? <AiFillStar /> : <AiOutlineStar />}
        </button>
    )
}
const MemoizedConductorButton = React.memo(ConductorButton)
export { MemoizedConductorButton as ConductorButton }

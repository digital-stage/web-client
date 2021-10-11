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

import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents } from '@digitalstage/api-types'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import React from 'react'

const ConductorButton = ({ stageMemberId }: { stageMemberId: string }) => {
    const emit = useEmit()
    const isDirector = useStageSelector(
        (state) => state.stageMembers.byId[stageMemberId].isDirector
    )
    const handleClick = React.useCallback(() => {
        if(emit) {
            emit(ClientDeviceEvents.ChangeStageMember, {
                _id: stageMemberId,
                isDirector: !isDirector,
            })
        }
    }, [emit, isDirector, stageMemberId])
    return (
        <button onClick={handleClick} className={`round minimal conductorToggle`}>
            {isDirector ? <AiFillStar /> : <AiOutlineStar />}
        </button>
    )
}
const MemoizedConductorButton = React.memo(ConductorButton)
export { MemoizedConductorButton as ConductorButton }

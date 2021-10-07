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

import React from 'react'
import Image from 'next/image'
import landscapeIcon from '../../public/icons/landscape.svg'
import portraitIcon from '../../public/icons/portrait.svg'
import {
    clientActions, useFilteredStageMembers,
    useStageSelector,
} from "@digitalstage/api-client-react";
import {HiFilter, HiOutlineFilter} from "react-icons/hi";
import {useDispatch} from "react-redux";
import {StageMemberView} from './StageMemberView';
import { ConductorOverlay } from './ConductorOverlay';

const StageView = () => {
    const dispatch = useDispatch()
    const showLanes = useStageSelector<boolean>(state => !!state.globals.showLanes)
    const showOffline = useStageSelector<boolean>(state => !!state.globals.showOffline)
    const sortedStageMemberIds = useFilteredStageMembers()
    const onOfflineToggle = React.useCallback(() => {
        dispatch(clientActions.showOffline(!showOffline))
    }, [dispatch, showOffline])
    const onLaneToggle = React.useCallback(() => {
        dispatch(clientActions.showLanes(!showLanes))
    }, [dispatch, showLanes])
    return (
        <div className={`wrapper stageLayout`}>
            <div className={`membersGrid ${showLanes ? 'lanes' : ''}`}>
                {sortedStageMemberIds
                    .map(stageMemberId => <StageMemberView key={stageMemberId} stageMemberId={stageMemberId}/>)}
            </div>
            <ConductorOverlay/>
            <div className="control">
                <button className="round" onClick={onOfflineToggle}>
                    {showOffline ? <HiOutlineFilter/> : <HiFilter/>}
                </button>
                <button className="round" onClick={onLaneToggle}>
                    {showLanes
                        ? (<Image src={portraitIcon} alt="Auf Hochkantdarstellung umschalten"/>)
                        : (<Image src={landscapeIcon} alt="Auf Breitbilddarstellung umschalten"/>)}
                </button>
            </div>
        </div>
    )
}
export {StageView}

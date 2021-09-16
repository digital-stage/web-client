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

const StageView = () => {
    const dispatch = useDispatch()
    const showLanes = useStageSelector<boolean>(state => state.globals.showLanes)
    const showOffline = useStageSelector<boolean>(state => state.globals.showOffline)
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

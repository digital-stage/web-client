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

import React from "react";
import {
    selectGroupPositionOfListener,
    selectIsCurrentlyAdmin,
    selectMode,
    selectSelectedDeviceId,
    selectSelectMode,
    selectShowOffline,
    selectStageDevicePositionOfListener,
    selectStageMemberPositionOfListener,
    useToggleShowOfflineMode,
    useTrackedSelector,
} from "@digitalstage/api-client-react";
import {HiFilter, HiOutlineFilter} from "react-icons/hi";
import {useDispatch} from "react-redux";
import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {Room, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {GroupItem} from "./GroupItem";
import {ResetPanel} from "./ResetPanel";
import {TextSwitch} from "../../../ui/TextSwitch";

const useListenerPosition = (): RoomPositionWithAngle => {
    const state = useTrackedSelector()
    const groupPosition = selectGroupPositionOfListener(state)
    const stageMemberPosition = selectStageMemberPositionOfListener(state)
    const position = selectStageDevicePositionOfListener(state)
    return React.useMemo(() => ({
        x: groupPosition.x + stageMemberPosition.x + position.x,
        y: groupPosition.y + stageMemberPosition.y + position.y,
        rZ: groupPosition.rZ + stageMemberPosition.rZ + position.rZ,
    }), [groupPosition.rZ, groupPosition.x, groupPosition.y, position.rZ, position.x, position.y, stageMemberPosition.rZ, stageMemberPosition.x, stageMemberPosition.y])
}

const RoomEditor = () => {
    const state = useTrackedSelector()
    const stageWidth = state.globals.stageId ? state.stages.byId[state.globals.stageId].width : 0
    const stageHeight = state.globals.stageId ? state.stages.byId[state.globals.stageId].height : 0
    const groupIds = state.globals.stageId ? state.groups.byStage[state.globals.stageId] : []
    const [selections, setSelections] = React.useState<RoomSelection[]>([])
    const onStageClicked = React.useCallback(() => {
        setSelections([])
    }, [])
    const onSelect = React.useCallback((selection: RoomSelection) => {
        setSelections((prev) => [
            ...prev,
            selection,
        ])
    }, [])
    const onDeselect = React.useCallback(({id}: RoomSelection) => {
        setSelections((prev) => prev.filter(sel => sel.id !== id))
    }, [])

    const isStageAdmin = selectIsCurrentlyAdmin(state)
    const selectedMode = selectSelectMode(state)
    const selectedDeviceId = selectedMode === "personal" ? selectSelectedDeviceId(state) : undefined
    const dispatch = useDispatch()
    const showOffline = selectShowOffline(state)
    const toggleOffline = useToggleShowOfflineMode()
    const listenerPosition = useListenerPosition()

    return (
        <>
            <Room
                onClick={onStageClicked}
                width={stageWidth}
                height={stageHeight}
                center={listenerPosition}
                rotation={-listenerPosition.rZ}
            >
                {groupIds.map(groupId =>
                    <GroupItem
                        key={groupId}
                        groupId={groupId}
                        selections={selections}
                        onSelect={onSelect}
                        onDeselect={onDeselect}
                    />
                )}
            </Room>
            {isStageAdmin ? (
                <ResetPanel
                    deviceId={selectedDeviceId}
                    selections={selections}
                />
            ) : null}
            <button className="round offlineToggle" onClick={toggleOffline}>
                {showOffline ? <HiOutlineFilter/> : <HiFilter/>}
            </button>
            {isStageAdmin ? (
                <TextSwitch
                    className="modeSwitch"
                    value={selectedMode}
                    onSelect={(v) => {
                        dispatch(selectMode(v === 'global' ? 'global' : 'personal'))
                    }}
                >
                    <span key="personal">Persönliche Einstellungen</span>
                    <span key="global">Voreinstellungen</span>
                </TextSwitch>
            ) : null}
        </>
    )
}
export {RoomEditor}
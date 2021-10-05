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
import {useStageSelector} from "@digitalstage/api-client-react";
import {useListenerPosition} from "./utils";
import {RoomSelection} from "./RoomEditor/RoomSelection";
import {Room} from "./RoomEditor";
import {GroupItem} from "./GroupItem";


const RoomEditor = () => {
    const stageWidth = useStageSelector(state => state.stages.byId[state.globals.stageId].width)
    const stageHeight = useStageSelector(state => state.stages.byId[state.globals.stageId].height)
    const groupIds = useStageSelector(state => state.groups.byStage[state.globals.stageId])
    const [selections, setSelections] = React.useState<RoomSelection[]>([])
    const onStageClicked = React.useCallback(() => {
        console.log("onStageClicked")
        setSelections([])
    }, [])
    const onSelect = React.useCallback((selection: RoomSelection) => {
        console.log("onSelect", selection)
        setSelections((prev) => [
            ...prev,
            selection,
        ])
    }, [])
    const onDeselect = React.useCallback(({id}: RoomSelection) => {
        console.log("onDeselect", id)
        setSelections((prev) => prev.filter(sel => sel.id !== id))
    }, [])

    React.useEffect(() => {
        console.log(selections)
    }, [selections])

    const listenerPosition = useListenerPosition()

    return (
        <>
            <Room
                onClick={onStageClicked}
                width={stageWidth}
                height={stageHeight}
                center={listenerPosition}
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
        </>
    )
}
export {RoomEditor}
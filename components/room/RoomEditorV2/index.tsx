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
import {selectResultingGroupPosition, useCustomStageMemberPosition, useStageMemberPosition} from "./utils";
import {RoomSelection} from "./RoomSelection";
import {Room, RoomItem} from "./Room";


const StageMemberItem = ({stageMemberId, local, selected, onSelect, onDeselect}: {
  stageMemberId: string,
  local: boolean,
  selected?: boolean,
  onSelect?: (selection: RoomSelection) => void
  onDeselect?: (selection: RoomSelection) => void
}) => {
  const stageWidth = useStageSelector(state => state.stages.byId[state.globals.stageId].width)
  const stageHeight = useStageSelector(state => state.stages.byId[state.globals.stageId].height)
  const groupPosition = useStageSelector(state =>
    selectResultingGroupPosition(state.stageMembers.byId[stageMemberId].groupId, state)
  )
  const position = useStageMemberPosition(stageMemberId)
  const customPosition = useCustomStageMemberPosition(stageMemberId)
  const userName = useStageSelector<string>(
    state =>
      state.stageMembers.byId[stageMemberId].userId &&
      state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
      || stageMemberId
  )
  const dragBounceFunc = React.useCallback(({x, y}: { x: number, y: number }) => ({
    x: Math.min((stageWidth / 2), Math.max(-(stageWidth / 2), x)),
    y: Math.min((stageHeight / 2), Math.max(-(stageHeight / 2), y)),
  }), [stageWidth, stageHeight])
  const onClicked = React.useCallback((e: MouseEvent) => {
    e.stopPropagation()
    if (selected) {
      if (onDeselect) {
        onDeselect({
          type: 'member',
          id: stageMemberId,
          customId: customPosition && customPosition._id
        })
      }
    } else {
      if (onSelect) {
        onSelect({
          type: 'member',
          id: stageMemberId,
          customId: customPosition && customPosition._id
        })
      }
    }
  }, [customPosition, onDeselect, onSelect, selected, stageMemberId])
  return (
    <RoomItem
      caption={userName}
      x={groupPosition.x + (customPosition?.x || position.x)}
      y={groupPosition.y + (customPosition?.y || position.y)}
      rZ={groupPosition.rZ + (customPosition?.rZ || position.rZ)}
      stageWidth={stageWidth}
      stageHeight={stageHeight}
      dragBounceFunc={dragBounceFunc}
      size={32}
      src={local ? "/room/center.svg" : "/room/member.svg"}
      selected={selected}
      onClicked={onClicked}
    />
  )
}

const RoomEditor = () => {
  const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
  const stageMemberIds = useStageSelector(state => state.stageMembers.byStage[state.globals.stageId])
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

  return (
    <>
      <Room onClick={onStageClicked}>
        {stageMemberIds.map(stageMemberId =>
          <StageMemberItem
            key={stageMemberId}
            stageMemberId={stageMemberId}
            local={stageMemberId === localStageMemberId}
            selected={selections.some(selection => selection.id === stageMemberId)}
            onSelect={onSelect}
            onDeselect={onDeselect}
          />
        )}
      </Room>
      <div className="outer">
        <div className="inner">
        </div>
      </div>
    </>
  )
}
export {RoomEditor}
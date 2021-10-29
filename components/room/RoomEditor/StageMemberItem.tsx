import {
  selectCustomStageMemberPositionByStageMemberId,
  selectNameOfStageMemberId, selectStageMemberPositionByStageMemberId,
  useEmit,
  useSelectStageDeviceIdsByStageMember, useTrackedSelector,
} from "../../../client";
import React from "react";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {CenterIcon} from "./icons/CenterIcon";
import {StageMemberIcon} from "./icons/StageMemberIcon";
import {StageDeviceItem} from "./StageDeviceItem";

const SHOW_STAGE_MEMBER = false

const StageMemberItem = ({stageMemberId, local, selections, onSelect, onDeselect, groupColor, groupPosition}: {
  stageMemberId: string,
  local: boolean,
  selections: RoomSelection[]
  onSelect?: (selection: RoomSelection) => void
  onDeselect?: (selection: RoomSelection) => void
  groupColor: string,
  groupPosition: RoomPositionWithAngle
}): JSX.Element => {
  const state = useTrackedSelector()
  const position = selectStageMemberPositionByStageMemberId(state, stageMemberId)
  const customPosition = selectCustomStageMemberPositionByStageMemberId(state, stageMemberId)
  const [currentPosition, setCurrentPosition] = React.useState<RoomPositionWithAngle>({
    x: customPosition?.x || position.x,
    y: customPosition?.y || position.y,
    rZ: customPosition?.rZ || position.rZ
  })
  React.useEffect(() => {
    setCurrentPosition({
      x: customPosition?.x || position.x,
      y: customPosition?.y || position.y,
      rZ: customPosition?.rZ || position.rZ
    })
  }, [customPosition?.rZ, customPosition?.x, customPosition?.y, position.rZ, position.x, position.y])

  const stageDeviceIds = useSelectStageDeviceIdsByStageMember(stageMemberId)
  // Stage management only for this item
  const selected = React.useMemo(() => selections.some(selection => selection.id === stageMemberId), [selections, stageMemberId])
  const userName =selectNameOfStageMemberId(state, stageMemberId)
  const onClicked = React.useCallback(() => {
    if (selected) {
      if (onDeselect) {
        onDeselect({
          type: 'member',
          id: stageMemberId,
          customId: customPosition && customPosition._id
        })
      }
    } else if (onSelect) {
        onSelect({
          type: 'member',
          id: stageMemberId,
          customId: customPosition && customPosition._id
        })
      }
  }, [customPosition, onDeselect, onSelect, selected, stageMemberId])

  const emit = useEmit()
  const deviceId = state.globals.selectedMode === "personal" ? state.globals.selectedDeviceId : undefined
  const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
    if (emit) {
      if (customPosition || deviceId) {
        emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
          stageMemberId,
          deviceId,
          ...position
        } as ClientDevicePayloads.SetCustomStageMemberPosition)
      } else {
        emit(ClientDeviceEvents.ChangeStageMember, {
          _id: stageMemberId,
          ...position
        } as ClientDevicePayloads.ChangeStageMember)
      }
    }
  }, [customPosition, deviceId, emit, stageMemberId])

  const onChange = React.useCallback((position: RoomPositionWithAngle) => {
    setCurrentPosition(position)
  }, [])

  return (
    <>
      {SHOW_STAGE_MEMBER && (
        <RoomItem
          caption={userName}
          x={currentPosition.x}
          y={currentPosition.y}
          rZ={currentPosition.rZ}
          offsetX={groupPosition.x}
          offsetY={groupPosition.y}
          offsetRz={groupPosition.rZ}
          size={0.5}
          color={groupColor}
          selected={selected}
          onClicked={onClicked}
          onChange={onChange}
          onFinalChange={onFinalChange}
        >
          {stageDeviceIds.length === 1 && local ? <CenterIcon/> : <StageMemberIcon/>}
        </RoomItem>
      )}
      {(!SHOW_STAGE_MEMBER || stageDeviceIds.length > 1) && stageDeviceIds.map(stageDeviceId =>
        <StageDeviceItem
          key={stageDeviceId}
          userName={userName}
          stageDeviceId={stageDeviceId}
          selections={selections}
          onSelect={onSelect}
          onDeselect={onDeselect}
          groupColor={groupColor}
          stageMemberPosition={{
            x: currentPosition.x + groupPosition.x,
            y: currentPosition.y + groupPosition.y,
            rZ: currentPosition.rZ + groupPosition.rZ,
          }}
        />
      )}
    </>
  )
}
export {StageMemberItem}
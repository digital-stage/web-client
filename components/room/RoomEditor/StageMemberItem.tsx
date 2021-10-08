import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import {useCustomStageMemberPosition, useStageMemberPosition} from "./utils";
import React from "react";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
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
}) => {
  const position = useStageMemberPosition(stageMemberId)
  const customPosition = useCustomStageMemberPosition(stageMemberId)
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

  const stageDeviceIds = useStageSelector<string[]>(
    (state) => {
      if (state.stageDevices.byStageMember[stageMemberId]) {
        if (state.globals.showOffline) {
          return state.stageDevices.byStageMember[stageMemberId]
        }
        return state.stageDevices.byStageMember[stageMemberId].filter(id => state.stageDevices.byId[id].active)
      }
      return []
    }
  )
  // Stage management only for this item
  const selected = React.useMemo(() => selections.some(selection => selection.id === stageMemberId), [selections, stageMemberId])
  const userName = useStageSelector<string>(
    state =>
      state.stageMembers.byId[stageMemberId].userId &&
      state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
      || stageMemberId
  )
  const onClicked = React.useCallback(() => {
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

  const emit = useEmit()
  const deviceId = useStageSelector<string | undefined>(state => state.globals.selectedMode === "personal" ? state.globals.selectedDeviceId : undefined)
  const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
    if (emit) {
      if (customPosition || deviceId) {
        emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
          stageMemberId: stageMemberId,
          deviceId: deviceId,
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
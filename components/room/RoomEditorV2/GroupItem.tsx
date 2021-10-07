import {useCustomGroupPosition, useGroupPosition} from "./utils";
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import React from "react";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {StageMemberItem} from "./StageMemberItem";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import { GroupIcon } from "./icons/GroupIcon";

const SHOW_GROUPS = false


const GroupItem = ({groupId, onSelect, onDeselect, selections}: {
    groupId: string,
    selections: RoomSelection[],
    onSelect?: (selection: RoomSelection) => void
    onDeselect?: (selection: RoomSelection) => void
}) => {
    const position = useGroupPosition(groupId)
    const customPosition = useCustomGroupPosition(groupId)
    const groupColor = useStageSelector(state => state.groups.byId[groupId].color)
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const stageMemberIds = useStageSelector<string[]>(
        (state) => {
            if (state.stageMembers.byGroup[groupId]) {
                if (state.globals.showOffline) {
                    return state.stageMembers.byGroup[groupId]
                }
                return state.stageMembers.byGroup[groupId].filter(id => state.stageMembers.byId[id].active)
            }
            return []
        }
    )
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

    // HANDLING GROUP NODE (UNUSED IF SHOW_GROUPS=false)
    const emit = useEmit()
    const selected = React.useMemo(() => selections.some(selection => selection.id === groupId), [groupId, selections])
    const groupName = useStageSelector(state => state.groups.byId[groupId].name)
    const deviceId = useStageSelector(state => state.globals.selectedDeviceId)
    const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
        if(emit) {
            if (customPosition && deviceId) {
                emit(ClientDeviceEvents.SetCustomGroupPosition, {
                    groupId: groupId,
                    deviceId: deviceId,
                    ...position
                } as ClientDevicePayloads.SetCustomGroupPosition)
            } else {
                emit(ClientDeviceEvents.ChangeGroup, {
                    _id: groupId,
                    ...position
                } as ClientDevicePayloads.ChangeGroup)
            }
        }
    }, [customPosition, deviceId, emit, groupId])

    return (
        <>
            {SHOW_GROUPS && stageMemberIds.length > 0 && (
                <RoomItem
                    caption={groupName}
                    x={currentPosition.x}
                    y={currentPosition.y}
                    rZ={currentPosition.rZ}
                    size={0.8}
                    selected={selected}
                    onClicked={() => {
                        if (selected) {
                            if (onDeselect) {
                                onDeselect({
                                    type: 'group',
                                    id: groupId,
                                    customId: customPosition && customPosition._id
                                })
                            }
                        } else {
                            if (onSelect) {
                                onSelect({
                                    type: 'group',
                                    id: groupId,
                                    customId: customPosition && customPosition._id
                                })
                            }
                        }
                    }}
                    color={groupColor}
                    onChange={position => setCurrentPosition(position)}
                    onFinalChange={onFinalChange}
                >
                    <GroupIcon fill={groupColor}/>
                </RoomItem>
            )}
            {stageMemberIds.map(stageMemberId =>
                <StageMemberItem
                    key={stageMemberId}
                    stageMemberId={stageMemberId}
                    local={stageMemberId === localStageMemberId}
                    selections={selections}
                    onSelect={onSelect}
                    onDeselect={onDeselect}
                    groupPosition={currentPosition}
                    groupColor={groupColor}
                />
            )}
        </>
    )
}
export {GroupItem}
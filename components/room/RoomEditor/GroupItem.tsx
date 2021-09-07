import {RoomSelection} from './RoomSelection'
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomGroupPosition,
    DefaultThreeDimensionalProperties,
    Group,
} from '@digitalstage/api-types'
import {RoomElement} from './RoomElement'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {StageMemberItem} from './StageMemberItem'

const GroupItem = ({
    groupId,
    deviceId,
    stageWidth,
    stageHeight,
    selection,
    onSelected,
}: {
    groupId: string
    deviceId: string
    stageWidth: number
    stageHeight: number
    selection: RoomSelection[]
    onSelected: (selection: RoomSelection) => void
}) => {
    const emit = useEmit()
    const stageMemberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[groupId] || []
    )
    const group = useStageSelector<Group>((state) => state.groups.byId[groupId])
    const customGroupPosition = useStageSelector<CustomGroupPosition>((state) =>
        deviceId &&
        state.customGroupPositions.byDeviceAndGroup[deviceId] &&
        state.customGroupPositions.byDeviceAndGroup[deviceId][groupId]
            ? state.customGroupPositions.byId[
                  state.customGroupPositions.byDeviceAndGroup[deviceId][groupId]
              ]
            : undefined
    )
    const modified = useMemo(() => {
        return deviceId
            ? !!customGroupPosition
            : !!group?.x &&
                  (group?.x !== DefaultThreeDimensionalProperties.x ||
                      group?.y !== DefaultThreeDimensionalProperties.y ||
                      group?.rZ !== DefaultThreeDimensionalProperties.rZ)
    }, [customGroupPosition, deviceId, group?.rZ, group?.x, group?.y])
    const [position, setPosition] = React.useState<{ x: number; y: number; rZ: number }>({
        x: customGroupPosition?.x || group?.x || DefaultThreeDimensionalProperties.x,
        y: customGroupPosition?.y || group?.y || DefaultThreeDimensionalProperties.y,
        rZ: customGroupPosition?.rZ || group?.rZ || DefaultThreeDimensionalProperties.rZ,
    })
   React.useEffect(() => {
        if (deviceId) {
            setPosition({
                x: customGroupPosition?.x || group?.x || DefaultThreeDimensionalProperties.x,
                y: customGroupPosition?.y || group?.y || DefaultThreeDimensionalProperties.x,
                rZ: customGroupPosition?.rZ || group?.rZ || DefaultThreeDimensionalProperties.x,
            })
        } else {
            setPosition({
                x: group?.x || DefaultThreeDimensionalProperties.x,
                y: group?.y || DefaultThreeDimensionalProperties.x,
                rZ: group?.rZ || DefaultThreeDimensionalProperties.x,
            })
        }
    }, [group, deviceId, customGroupPosition])
    const handleFinalChange = useCallback(
        (event: { x?: number; y?: number; rZ?: number }) => {
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomGroupPosition, {
                    groupId,
                    deviceId,
                    ...event,
                } as ClientDevicePayloads.SetCustomGroupPosition)
            } else {
                emit(ClientDeviceEvents.ChangeGroup, {
                    _id: groupId,
                    ...event,
                } as ClientDevicePayloads.ChangeGroup)
            }
        },
        [deviceId, emit, groupId]
    )

    return (
        <>
            <RoomElement
                name={group?.name || groupId}
                color={group?.color || '#fff'}
                modified={modified}
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
                size={64}
                src="/room/group.svg"
                onChange={(e) =>
                    setPosition((prev) => ({
                        x: e.x || prev.x,
                        y: e.y || prev.y,
                        rZ: e.rZ || prev.rZ,
                    }))
                }
                onFinalChange={handleFinalChange}
                selected={selection.some((value) => {
                    if (value.type === 'group') {
                        if (customGroupPosition) return value.id === customGroupPosition._id
                        return value.id === groupId
                    }
                })}
                onSelected={() =>
                    onSelected({
                        type: 'group',
                        id: customGroupPosition ? customGroupPosition._id : groupId,
                    })
                }
            />
            {stageMemberIds.map((stageMemberId) => (
                <StageMemberItem
                    key={stageMemberId}
                    stageMemberId={stageMemberId}
                    deviceId={deviceId}
                    groupColor={group?.color || '#fff'}
                    offsetX={position.x}
                    offsetY={position.y}
                    offsetRz={position.rZ}
                    stageWidth={stageWidth}
                    stageHeight={stageHeight}
                    selection={selection}
                    onSelected={onSelected}
                />
            ))}
        </>
    )
}
export { GroupItem }

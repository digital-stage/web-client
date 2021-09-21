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

import {RoomSelection} from './RoomSelection'
import {useEmit, useStageSelector} from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomGroupPosition,
    DefaultThreeDimensionalProperties,
    Group,
} from '@digitalstage/api-types'
import {RoomElement} from './RoomElement'
import React, {useCallback, useEffect, useMemo, useState} from 'react'
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
export {GroupItem}

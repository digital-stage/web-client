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
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomStageMemberPosition,
    DefaultThreeDimensionalProperties,
    StageMember,
} from '@digitalstage/api-types'
import {RoomElement} from './RoomElement'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {StageDeviceItem} from './StageDeviceItem'
import { shallowEqual } from 'react-redux'

const StageMemberItem = ({
    stageMemberId,
    deviceId,
    groupColor,
    offsetX,
    offsetY,
    offsetRz,
    stageWidth,
    stageHeight,
    selection,
    onSelected,
}: {
    stageMemberId: string
    deviceId: string
    groupColor: string
    offsetX: number
    offsetY: number
    offsetRz: number
    stageWidth: number
    stageHeight: number
    selection: RoomSelection[]
    onSelected: (selection: RoomSelection) => void
}) => {
    const emit = useEmit()
    const stageMember = useStageSelector<StageMember | undefined>(
        (state) => state.stageMembers.byId[stageMemberId],
        shallowEqual
    )
    const isStreaming = useStageSelector(
        (state) => state.audioTracks.byStageMember[stageMemberId]?.length > 0
    )
    const customStageMemberPosition = useStageSelector<CustomStageMemberPosition>(
        (state) =>
            deviceId &&
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId][stageMemberId]
                ? state.customStageMemberPositions.byId[
                      state.customStageMemberPositions.byDeviceAndStageMember[deviceId][
                          stageMemberId
                      ]
                  ]
                : undefined,
        shallowEqual
    )
    const modified = useMemo(() => {
        return deviceId
            ? !!customStageMemberPosition
            : !!stageMember?.x &&
                  (stageMember?.x !== DefaultThreeDimensionalProperties.x ||
                      stageMember?.y !== DefaultThreeDimensionalProperties.y ||
                      stageMember?.rZ !== DefaultThreeDimensionalProperties.rZ)
    }, [customStageMemberPosition, deviceId, stageMember?.rZ, stageMember?.x, stageMember?.y])
    const username = useStageSelector<string | undefined>((state) =>
        stageMember ? state.users.byId[stageMember.userId]?.name : undefined
    )
    const stageDeviceIds = useStageSelector<string[]>(
        (state) => state.stageDevices.byStageMember[stageMemberId] || []
    )
    const [position, setPosition] = React.useState<{ x: number; y: number; rZ: number }>({
        x: customStageMemberPosition?.x || stageMember?.x || DefaultThreeDimensionalProperties.x,
        y: customStageMemberPosition?.y || stageMember?.y || DefaultThreeDimensionalProperties.y,
        rZ:
            customStageMemberPosition?.rZ ||
            stageMember?.rZ ||
            DefaultThreeDimensionalProperties.rZ,
    })
   React.useEffect(() => {
        if (deviceId) {
            setPosition({
                x:
                    offsetX +
                    (customStageMemberPosition?.x ||
                        stageMember?.x ||
                        DefaultThreeDimensionalProperties.x),
                y:
                    offsetY +
                    (customStageMemberPosition?.y ||
                        stageMember?.y ||
                        DefaultThreeDimensionalProperties.y),
                rZ:
                    offsetRz +
                    (customStageMemberPosition?.rZ ||
                        stageMember?.rZ ||
                        DefaultThreeDimensionalProperties.rZ),
            })
        } else {
            setPosition({
                x: offsetX + stageMember?.x || DefaultThreeDimensionalProperties.x,
                y: offsetY + stageMember?.y || DefaultThreeDimensionalProperties.y,
                rZ: offsetRz + stageMember?.rZ || DefaultThreeDimensionalProperties.rZ,
            })
        }
    }, [stageMember, deviceId, customStageMemberPosition, offsetX, offsetY, offsetRz])
    const handleFinalChange = useCallback(
        (event: { x?: number; y?: number; rZ?: number }) => {
            let normalized = {
                x: event.x ? event.x - offsetX : undefined,
                y: event.y ? event.y - offsetY : undefined,
                rZ: event.rZ ? event.rZ - offsetRz : undefined,
            }
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
                    stageMemberId,
                    deviceId,
                    ...normalized,
                } as ClientDevicePayloads.SetCustomStageMemberPosition)
            } else {
                emit(ClientDeviceEvents.ChangeStageMember, {
                    _id: stageMemberId,
                    ...normalized,
                } as ClientDevicePayloads.ChangeStageMember)
            }
        },
        [deviceId, emit, offsetRz, offsetX, offsetY, stageMemberId]
    )

    return (
        <>
            <RoomElement
                name={username || stageMemberId}
                color={groupColor}
                modified={modified}
                showOnlineStatus={true}
                online={stageMember?.active}
                streaming={isStreaming}
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
                size={64}
                src="/room/member.svg"
                onChange={(e) =>
                    setPosition((prev) => ({
                        x: e.x || prev.x,
                        y: e.y || prev.y,
                        rZ: e.rZ || prev.rZ,
                    }))
                }
                onFinalChange={handleFinalChange}
                selected={selection.some((value) => {
                    if (value.type === 'member') {
                        if (customStageMemberPosition)
                            return value.id === customStageMemberPosition._id
                        return value.id === stageMemberId
                    }
                })}
                onSelected={() =>
                    onSelected({
                        type: 'member',
                        id: customStageMemberPosition
                            ? customStageMemberPosition._id
                            : stageMemberId,
                    })
                }
                linePoints={[offsetX, offsetY, position.x, position.y]}
                lineDash={[10, 10]}
            />
            {stageDeviceIds.map((stageDeviceId, index) => (
                <StageDeviceItem
                    key={stageDeviceId}
                    stageDeviceId={stageDeviceId}
                    deviceId={deviceId}
                    numStageDevices={stageDeviceIds.length}
                    index={index}
                    username={username}
                    groupColor={groupColor}
                    stageWidth={stageWidth}
                    stageHeight={stageHeight}
                    selection={selection}
                    onSelected={onSelected}
                    offsetX={position.x}
                    offsetY={position.y}
                    offsetRz={position.rZ}
                />
            ))}
        </>
    )
}
export { StageMemberItem }

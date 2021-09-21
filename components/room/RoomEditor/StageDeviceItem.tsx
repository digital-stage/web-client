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
    CustomStageDevicePosition,
    DefaultThreeDimensionalProperties,
    StageDevice,
} from '@digitalstage/api-types'
import {RoomElement} from './RoomElement'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {AudioTrackItem} from './AudioTrackItem'

const StageDeviceItem = ({
    stageDeviceId,
    deviceId,
    username,
    index,
    numStageDevices,
    groupColor,
    offsetX,
    offsetY,
    offsetRz,
    stageWidth,
    stageHeight,
    selection,
    onSelected,
}: {
    stageDeviceId: string
    deviceId: string
    username: string
    numStageDevices: number
    index: number
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
    const stageDevice = useStageSelector<StageDevice | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId]
    )
    const isLocal = useStageSelector(
        (state) => !!stageDeviceId && stageDeviceId === state.globals.localStageDeviceId
    )
    const customStageDevicePosition = useStageSelector<CustomStageDevicePosition>((state) =>
        deviceId &&
        state.customStageDevicePositions.byDeviceAndStageDevice[deviceId] &&
        state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDeviceId]
            ? state.customStageDevicePositions.byId[
                  state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDeviceId]
              ]
            : undefined
    )
    const modified = useMemo(() => {
        return deviceId
            ? !!customStageDevicePosition
            : !!stageDevice?.x &&
                  (stageDevice?.x !== DefaultThreeDimensionalProperties.x ||
                      stageDevice?.y !== DefaultThreeDimensionalProperties.y ||
                      stageDevice?.rZ !== DefaultThreeDimensionalProperties.rZ)
    }, [customStageDevicePosition, deviceId, stageDevice?.rZ, stageDevice?.x, stageDevice?.y])
    const audioTrackIds = useStageSelector<string[]>(
        (state) => state.audioTracks.byStageDevice[stageDeviceId] || []
    )
    const [position, setPosition] = React.useState<{ x: number; y: number; rZ: number }>({
        x: customStageDevicePosition?.x || stageDevice?.x || DefaultThreeDimensionalProperties.x,
        y: customStageDevicePosition?.y || stageDevice?.y || DefaultThreeDimensionalProperties.y,
        rZ:
            customStageDevicePosition?.rZ ||
            stageDevice?.rZ ||
            DefaultThreeDimensionalProperties.rZ,
    })
   React.useEffect(() => {
        if (stageDevice) {
            if (deviceId) {
                setPosition({
                    x: offsetX + (customStageDevicePosition?.x || stageDevice.x),
                    y: offsetY + (customStageDevicePosition?.y || stageDevice.y),
                    rZ: offsetRz + (customStageDevicePosition?.rZ || stageDevice.rZ),
                })
            } else {
                setPosition({
                    x: offsetX + stageDevice.x,
                    y: offsetY + stageDevice.y,
                    rZ: offsetRz + stageDevice.rZ,
                })
            }
        }
    }, [stageDevice, deviceId, customStageDevicePosition, offsetX, offsetY, offsetRz])
    const handleFinalChange = useCallback(
        (event: { x?: number; y?: number; rZ?: number }) => {
            let normalized = {
                x: event.x ? event.x - offsetX : undefined,
                y: event.y ? event.y - offsetY : undefined,
                rZ: event.rZ ? event.rZ - offsetRz : undefined,
            }
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomStageDevicePosition, {
                    stageDeviceId,
                    deviceId,
                    ...normalized,
                } as ClientDevicePayloads.SetCustomStageDevicePosition)
            } else {
                emit(ClientDeviceEvents.ChangeStageDevice, {
                    _id: stageDeviceId,
                    ...normalized,
                } as ClientDevicePayloads.ChangeStageDevice)
            }
        },
        [deviceId, emit, offsetRz, offsetX, offsetY, stageDeviceId]
    )

    return (
        <>
            {numStageDevices > 1 || modified ? (
                <>
                    <RoomElement
                        name={`${index + 1}/${numStageDevices}: ${stageDevice?.name}`}
                        color={groupColor}
                        modified={modified}
                        streaming={audioTrackIds.length > 0}
                        showOnlineStatus={true}
                        online={stageDevice?.active}
                        x={position.x}
                        y={position.y}
                        rZ={position.rZ}
                        stageWidth={stageWidth}
                        stageHeight={stageHeight}
                        size={48}
                        src={isLocal ? '/room/center.svg' : '/room/device.svg'}
                        onChange={(e) =>
                            setPosition((prev) => ({
                                x: e.x || prev.x,
                                y: e.y || prev.y,
                                rZ: e.rZ || prev.rZ,
                            }))
                        }
                        onFinalChange={handleFinalChange}
                        selected={selection.some((value) => {
                            if (value.type === 'device') {
                                if (customStageDevicePosition)
                                    return value.id === customStageDevicePosition._id
                                return value.id === stageDeviceId
                            }
                        })}
                        onSelected={() =>
                            onSelected({
                                type: 'device',
                                id: customStageDevicePosition
                                    ? customStageDevicePosition._id
                                    : stageDeviceId,
                            })
                        }
                        linePoints={[offsetX, offsetY, position.x, position.y]}
                    />
                </>
            ) : null}
            {audioTrackIds.map((audioTrackId, index) => (
                <AudioTrackItem
                    key={stageDeviceId}
                    audioTrackId={audioTrackId}
                    index={index}
                    isLocal={isLocal}
                    numAudioTracks={audioTrackIds.length}
                    deviceId={deviceId}
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
export { StageDeviceItem }

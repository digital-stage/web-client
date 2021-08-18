import RoomSelection from './RoomSelection'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomStageDevicePosition,
    DefaultThreeDimensionalProperties,
    StageDevice,
} from '@digitalstage/api-types'
import RoomElement from './RoomElement'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import AudioTrackItem from './AudioTrackItem'

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
    const { emit } = useConnection()
    const stageDevice = useStageSelector<StageDevice | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId]
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
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: customStageDevicePosition?.x || stageDevice?.x || DefaultThreeDimensionalProperties.x,
        y: customStageDevicePosition?.y || stageDevice?.y || DefaultThreeDimensionalProperties.y,
        rZ:
            customStageDevicePosition?.rZ ||
            stageDevice?.rZ ||
            DefaultThreeDimensionalProperties.rZ,
    })
    useEffect(() => {
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
                        name={`${username} #${index + 1}/${numStageDevices}: ${stageDevice?.name}`}
                        color={groupColor}
                        modified={modified}
                        showOnlineStatus={true}
                        online={stageDevice?.active}
                        x={position.x}
                        y={position.y}
                        rZ={position.rZ}
                        stageWidth={stageWidth}
                        stageHeight={stageHeight}
                        size={48}
                        src="/room/device.svg"
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
export default StageDeviceItem

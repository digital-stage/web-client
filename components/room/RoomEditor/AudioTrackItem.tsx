import RoomSelection from './RoomSelection'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomAudioTrackPosition,
    DefaultThreeDimensionalProperties,
    AudioTrack,
} from '@digitalstage/api-types'
import RoomElement from './RoomElement'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

const AudioTrackItem = ({
    audioTrackId,
    deviceId,
    numAudioTracks,
    index,
    username,
    groupColor,
    offsetX,
    offsetY,
    offsetRz,
    stageWidth,
    stageHeight,
    selection,
    onSelected,
}: {
    audioTrackId: string
    deviceId: string
    numAudioTracks: number
    index: number
    groupColor: string
    username: string
    offsetX: number
    offsetY: number
    offsetRz: number
    stageWidth: number
    stageHeight: number
    selection: RoomSelection[]
    onSelected: (selection: RoomSelection) => void
}) => {
    const { emit } = useConnection()
    const audioTrack = useStageSelector<AudioTrack | undefined>(
        (state) => state.audioTracks.byId[audioTrackId]
    )
    const customAudioTrackPosition = useStageSelector<CustomAudioTrackPosition>((state) =>
        deviceId &&
        state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId] &&
        state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId][audioTrackId]
            ? state.customAudioTrackPositions.byId[
                  state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId][audioTrackId]
              ]
            : undefined
    )
    const modified = useMemo(() => {
        return deviceId
            ? !!customAudioTrackPosition
            : !!audioTrack?.x &&
                  (audioTrack?.x !== DefaultThreeDimensionalProperties.x ||
                      audioTrack?.y !== DefaultThreeDimensionalProperties.y ||
                      audioTrack?.rZ !== DefaultThreeDimensionalProperties.rZ)
    }, [customAudioTrackPosition, deviceId, audioTrack?.rZ, audioTrack?.x, audioTrack?.y])
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: customAudioTrackPosition?.x || audioTrack?.x || DefaultThreeDimensionalProperties.x,
        y: customAudioTrackPosition?.y || audioTrack?.y || DefaultThreeDimensionalProperties.y,
        rZ: customAudioTrackPosition?.rZ || audioTrack?.rZ || DefaultThreeDimensionalProperties.rZ,
    })
    useEffect(() => {
        if (audioTrack) {
            if (deviceId) {
                setPosition({
                    x: offsetX + (customAudioTrackPosition?.x || audioTrack.x),
                    y: offsetY + (customAudioTrackPosition?.y || audioTrack.y),
                    rZ: offsetRz + (customAudioTrackPosition?.rZ || audioTrack.rZ),
                })
            } else {
                setPosition({
                    x: offsetX + audioTrack.x,
                    y: offsetY + audioTrack.y,
                    rZ: offsetRz + audioTrack.rZ,
                })
            }
        }
    }, [audioTrack, deviceId, customAudioTrackPosition, offsetX, offsetY, offsetRz])
    const handleFinalChange = useCallback(
        (event: { x?: number; y?: number; rZ?: number }) => {
            let normalized = {
                x: event.x ? event.x - offsetX : undefined,
                y: event.y ? event.y - offsetY : undefined,
                rZ: event.rZ ? event.rZ - offsetRz : undefined,
            }
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomAudioTrackPosition, {
                    audioTrackId,
                    deviceId,
                    ...normalized,
                } as ClientDevicePayloads.SetCustomAudioTrackPosition)
            } else {
                emit(ClientDeviceEvents.ChangeAudioTrack, {
                    _id: audioTrackId,
                    ...normalized,
                } as ClientDevicePayloads.ChangeAudioTrack)
            }
        },
        [deviceId, emit, offsetRz, offsetX, offsetY, audioTrackId]
    )

    if (numAudioTracks > 1 || modified) {
        return (
            <RoomElement
                name={`${username} Track #${index + 1}`}
                color={groupColor}
                modified={modified}
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                stageWidth={stageWidth}
                stageHeight={stageHeight}
                size={48}
                src="/room/track.svg"
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
                        if (customAudioTrackPosition)
                            return value.id === customAudioTrackPosition._id
                        return value.id === audioTrackId
                    }
                })}
                onSelected={() =>
                    onSelected({
                        type: 'track',
                        id: customAudioTrackPosition ? customAudioTrackPosition._id : audioTrackId,
                    })
                }
                linePoints={[offsetX, offsetY, position.x, position.y]}
                lineDash={[2, 2]}
            />
        )
    }
    return null
}
export default AudioTrackItem

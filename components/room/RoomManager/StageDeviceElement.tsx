import {
    AudioTracks,
    CustomAudioTrackPositions,
    CustomStageDevicePosition,
    StageDevice,
    User,
} from '@digitalstage/api-client-react'
import React, { useCallback, useEffect, useState } from 'react'
import { ITeckosClient } from 'teckos-client'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import StageElement from './StageElement'
import ElementSelection from './ElementSelection'
import AudioTrackElement from './AudioTrackElement'

const StageDeviceElement = ({
    connection,
    deviceId,
    globalMode,
    offsetX,
    offsetY,
    offsetRz,
    stageDevice,
    customStageDevice,
    audioTracks,
    customAudioTracks,
    onSelected,
    selected,
    user,
    color,
    stageDeviceImage,
    audioTrackImage,
    currentAudioTrackImage,
}: {
    connection: ITeckosClient
    deviceId: string
    globalMode: boolean
    offsetX: number
    offsetY: number
    offsetRz: number
    stageDevice: StageDevice
    customStageDevice?: CustomStageDevicePosition
    audioTracks: AudioTracks
    customAudioTracks: CustomAudioTrackPositions
    onSelected: (selection: ElementSelection) => void
    selected?: ElementSelection
    user?: User
    color: string
    stageDeviceImage: CanvasImageSource
    audioTrackImage: CanvasImageSource
    currentAudioTrackImage: CanvasImageSource
}) => {
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: offsetX + stageDevice.x,
        y: offsetY + stageDevice.y,
        rZ: offsetRz + stageDevice.rZ,
    })
    useEffect(() => {
        if (!globalMode && customStageDevice) {
            setPosition({
                x: offsetX + customStageDevice.x,
                y: offsetY + customStageDevice.y,
                rZ: offsetRz + customStageDevice.rZ,
            })
        } else {
            setPosition({
                x: offsetX + stageDevice.x,
                y: offsetY + stageDevice.y,
                rZ: offsetRz + stageDevice.rZ,
            })
        }
    }, [
        globalMode,
        stageDevice.x,
        stageDevice.y,
        stageDevice.rZ,
        customStageDevice,
        offsetX,
        offsetY,
        offsetRz,
    ])

    useEffect(() => {
        if (selected) {
            if (
                selected.stageDeviceId === stageDevice._id &&
                customStageDevice &&
                !selected.customStageDeviceId
            ) {
                onSelected({
                    ...selected,
                    customStageDeviceId: customStageDevice._id,
                })
            }
        }
    }, [selected, stageDevice._id, customStageDevice])

    const commitChanges = useCallback(() => {
        if (connection) {
            if (globalMode) {
                connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                    _id: stageDevice._id,
                    x: position.x - offsetX,
                    y: position.y - offsetY,
                    rZ: position.rZ - offsetRz,
                } as ClientDevicePayloads.ChangeStageDevice)
            } else {
                connection.emit(ClientDeviceEvents.SetCustomStageDevicePosition, {
                    stageDeviceId: stageDevice._id,
                    deviceId,
                    x: position.x - offsetX,
                    y: position.y - offsetY,
                    rZ: position.rZ - offsetRz,
                } as ClientDevicePayloads.SetCustomStageDevicePosition)
            }
        }
    }, [connection, globalMode, stageDevice._id, deviceId, position, offsetX, offsetY, offsetRz])

    return (
        <>
            <StageElement
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                size={64}
                image={stageDeviceImage}
                onChanged={(currPos) => {
                    setPosition(currPos)
                }}
                onChangeFinished={({ x, y, rZ }) => {
                    setPosition({ x, y, rZ })
                    commitChanges()
                }}
                selected={
                    selected &&
                    (selected.type === 'sd' || selected.type === 'csd') &&
                    selected.stageDeviceId === stageDevice._id
                }
                onClick={() =>
                    onSelected({
                        stageDeviceId: stageDevice._id,
                        customStageDeviceId: customStageDevice && customStageDevice._id,
                        type: globalMode ? 'sd' : 'csd',
                    })
                }
                label={`${user?.name}: ${stageDevice?.name || stageDevice._id}`}
                color={color}
                opacity={globalMode || customStageDevice ? 1 : 0.6}
            />

            {audioTracks.byStageDevice[stageDevice._id] &&
                audioTracks.byStageDevice[stageDevice._id].length > 1 &&
                audioTracks.byStageDevice[stageDevice._id]
                    .map((id) => audioTracks.byId[id])
                    .map((audioTrack) => {
                        const customAudioTrack =
                            customAudioTracks.byDeviceAndAudioTrack[deviceId] &&
                            customAudioTracks.byDeviceAndAudioTrack[deviceId][audioTrack._id] &&
                            customAudioTracks.byId[
                                customAudioTracks.byDeviceAndAudioTrack[deviceId][audioTrack._id]
                            ]
                        return (
                            <AudioTrackElement
                                key={stageDevice._id}
                                connection={connection}
                                deviceId={deviceId}
                                globalMode={globalMode}
                                offsetX={position.x}
                                offsetY={position.y}
                                offsetRz={position.rZ}
                                audioTrack={audioTrack}
                                customAudioTrack={customAudioTrack}
                                selected={selected}
                                onSelected={onSelected}
                                user={user}
                                color={color || '#fff'}
                                audioTrackImage={
                                    stageDevice.deviceId === deviceId
                                        ? currentAudioTrackImage
                                        : audioTrackImage
                                }
                            />
                        )
                    })}
        </>
    )
}
StageDeviceElement.defaultProps = {
    customStageDevice: undefined,
    user: undefined,
    selected: undefined,
}
export default StageDeviceElement

import { ITeckosClient } from 'teckos-client'
import {
    AudioTracks,
    CustomAudioTrackPositions,
    CustomStageDevicePositions,
    StageDevices,
    StageMember,
    User,
} from '@digitalstage/api-client-react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomStageMemberPosition,
} from '@digitalstage/api-types'
import React, { useCallback, useEffect, useState } from 'react'
import StageElement from './StageElement'
import StageDeviceElement from './StageDeviceElement'
import ElementSelection from './ElementSelection'

const StageMemberElement = ({
    deviceId,
    globalMode,
    stageMember,
    user,
    stageDevices,
    customStageMember,
    customStageDevices,
    audioTracks,
    customAudioTracks,
    connection,
    selected,
    onSelected,
    color,
    stageMemberImage,
    stageDeviceImage,
    currentStageDeviceImage,
    audioTrackImage,
    currentAudioTrackImage,
}: {
    connection: ITeckosClient
    deviceId: string
    globalMode: boolean
    stageMember: StageMember
    stageDevices: StageDevices
    customStageMember?: CustomStageMemberPosition
    customStageDevices: CustomStageDevicePositions
    audioTracks: AudioTracks
    customAudioTracks: CustomAudioTrackPositions
    user?: User
    onSelected: (selection: ElementSelection) => void
    selected?: ElementSelection
    color: string
    stageMemberImage: CanvasImageSource
    stageDeviceImage: CanvasImageSource
    currentStageDeviceImage: CanvasImageSource
    audioTrackImage: CanvasImageSource
    currentAudioTrackImage: CanvasImageSource
}) => {
    // We cannot use useContext here, so we outsourced all useStageSelector calls into the parent object
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: stageMember.x,
        y: stageMember.y,
        rZ: stageMember.rZ,
    })

    useEffect(() => {
        if (!globalMode && customStageMember) {
            setPosition({
                x: customStageMember.x,
                y: customStageMember.y,
                rZ: customStageMember.rZ,
            })
        } else {
            setPosition({ x: stageMember.x, y: stageMember.y, rZ: stageMember.rZ })
        }
    }, [globalMode, stageMember.x, stageMember.y, stageMember.rZ, customStageMember])

    const commitChanges = useCallback(() => {
        if (connection) {
            if (globalMode) {
                connection.emit(ClientDeviceEvents.ChangeStageMember, {
                    _id: stageMember._id,
                    ...position,
                } as ClientDevicePayloads.ChangeStageMember)
            } else {
                connection.emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
                    stageMemberId: stageMember._id,
                    deviceId,
                    ...position,
                } as ClientDevicePayloads.SetCustomStageMemberPosition)
            }
        }
    }, [connection, globalMode, stageMember._id, deviceId, position])

    useEffect(() => {
        if (selected) {
            if (
                selected.stageMemberId === stageMember._id &&
                customStageMember &&
                !selected.customStageMemberId
            ) {
                onSelected({
                    ...selected,
                    customStageMemberId: customStageMember._id,
                })
            }
        }
    }, [selected, stageMember._id, customStageMember])

    return (
        <>
            <StageElement
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                size={96}
                image={stageMemberImage}
                onChanged={(currPosition) => {
                    setPosition(currPosition)
                }}
                onChangeFinished={(currPosition) => {
                    setPosition(currPosition)
                    commitChanges()
                }}
                selected={
                    selected &&
                    (selected.type === 'sm' || selected.type === 'csm') &&
                    selected.stageMemberId === stageMember._id
                }
                onClick={() =>
                    onSelected({
                        stageMemberId: stageMember._id,
                        customStageMemberId: customStageMember && customStageMember._id,
                        type: globalMode ? 'sm' : 'csm',
                    })
                }
                label={user?.name || stageMember._id}
                color={color || '#fff'}
                opacity={globalMode || customStageMember ? 1 : 0.6}
            />
            {stageDevices.byStageMember[stageMember._id] &&
                stageDevices.byStageMember[stageMember._id].length > 1 &&
                stageDevices.byStageMember[stageMember._id]
                    .map((id) => stageDevices.byId[id])
                    .map((stageDevice) => {
                        const customStageDevice =
                            customStageDevices.byDeviceAndStageDevice[deviceId] &&
                            customStageDevices.byDeviceAndStageDevice[deviceId][stageDevice._id] &&
                            customStageDevices.byId[
                                customStageDevices.byDeviceAndStageDevice[deviceId][stageDevice._id]
                            ]
                        return (
                            <StageDeviceElement
                                key={stageDevice._id}
                                connection={connection}
                                deviceId={deviceId}
                                globalMode={globalMode}
                                offsetX={position.x}
                                offsetY={position.y}
                                offsetRz={position.rZ}
                                stageDevice={stageDevice}
                                customStageDevice={customStageDevice}
                                audioTracks={audioTracks}
                                customAudioTracks={customAudioTracks}
                                selected={selected}
                                onSelected={onSelected}
                                user={user}
                                color={color || '#fff'}
                                stageDeviceImage={
                                    deviceId === stageDevice.deviceId
                                        ? currentStageDeviceImage
                                        : stageDeviceImage
                                }
                                audioTrackImage={audioTrackImage}
                                currentAudioTrackImage={currentAudioTrackImage}
                            />
                        )
                    })}
        </>
    )
}
StageMemberElement.defaultProps = {
    user: undefined,
    customStageMember: undefined,
    selected: undefined,
}
export default StageMemberElement

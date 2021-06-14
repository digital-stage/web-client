import { useEffect, useState } from 'react'
import {
    CustomStageDevicePosition,
    CustomStageDeviceVolume,
    StageDevice,
    StageMember,
    useStageSelector,
} from '@digitalstage/api-client-react'
import {
    CustomGroupPosition,
    CustomGroupVolume,
    CustomStageMemberPosition,
    CustomStageMemberVolume,
    Group,
} from '@digitalstage/api-types'
import Position from './Position'
import Volume from './Volume'

const reduceStageDevicePosition = (
    stageDeviceId: string,
    localDeviceId: string
): {
    position: Position
    volume: Volume
} => {
    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
        rZ: 0,
    })
    const [volume, setVolume] = useState<Volume>({
        volume: 1,
        muted: true,
    })

    // Fetch necessary model
    const stageDevice = useStageSelector<StageDevice | undefined>(
        (state) => stageDeviceId && state.stageDevices.byId[stageDeviceId]
    )
    const customStageDevicePosition = useStageSelector<CustomStageDevicePosition | undefined>(
        (state) =>
            stageDevice &&
            state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId] &&
            state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId][
                stageDevice._id
            ] &&
            state.customStageDevicePositions.byId[
                state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId][
                    stageDevice._id
                ]
            ]
    )
    const customStageDeviceVolume = useStageSelector<CustomStageDeviceVolume | undefined>(
        (state) =>
            stageDevice &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][stageDevice._id] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][
                    stageDevice._id
                ]
            ]
    )
    const stageMember = useStageSelector<StageMember | undefined>(
        (state) => stageDevice && state.stageMembers.byId[stageDevice.stageMemberId]
    )
    const customStageMemberPosition = useStageSelector<CustomStageMemberPosition | undefined>(
        (state) =>
            stageMember &&
            state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId] &&
            state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId][
                stageMember._id
            ] &&
            state.customStageMemberPositions.byId[
                state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId][
                    stageMember._id
                ]
            ]
    )
    const customStageMemberVolume = useStageSelector<CustomStageMemberVolume | undefined>(
        (state) =>
            stageMember &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][stageMember._id] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][
                    stageMember._id
                ]
            ]
    )
    const group = useStageSelector<Group | undefined>(
        (state) => stageMember && state.groups.byId[stageMember.groupId]
    )
    const customGroupPosition = useStageSelector<CustomGroupPosition | undefined>(
        (state) =>
            group &&
            state.customGroupPositions.byDeviceAndGroup[localDeviceId] &&
            state.customGroupPositions.byDeviceAndGroup[localDeviceId][group._id] &&
            state.customGroupPositions.byId[
                state.customGroupPositions.byDeviceAndGroup[localDeviceId][group._id]
            ]
    )
    const customGroupVolume = useStageSelector<CustomGroupVolume | undefined>(
        (state) =>
            group &&
            state.customGroupVolumes.byDeviceAndGroup[localDeviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[localDeviceId][group._id] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[localDeviceId][group._id]
            ]
    )

    // Calculate position
    useEffect(() => {
        // Only calculate if ready and the default entities are available
        if (group && stageMember && stageDevice) {
            let x = customGroupPosition?.x || group.x
            let y = customGroupPosition?.y || group.y
            let rZ = customGroupPosition?.rZ || group.rZ
            x += customStageMemberPosition?.x || stageMember.x
            y += customStageMemberPosition?.y || stageMember.y
            rZ += customStageMemberPosition?.rZ || stageMember.rZ
            x += customStageDevicePosition?.x || stageDevice.x
            y += customStageDevicePosition?.y || stageDevice.y
            rZ += customStageDevicePosition?.rZ || stageDevice.rZ
            setPosition({
                x,
                y,
                rZ,
            })
        }
    }, [
        group,
        customGroupPosition,
        stageMember,
        customStageMemberPosition,
        stageDevice,
        customStageDevicePosition,
    ])

    // Calculate volume
    useEffect(() => {
        // Only calculate if ready and the default entities are available
        if (group && stageMember && stageDevice) {
            let calculatedVolume = customGroupVolume?.volume || group.volume
            calculatedVolume *= customStageMemberVolume?.volume || stageMember.volume
            calculatedVolume *= customStageDeviceVolume?.volume || stageDevice.volume

            const muted =
                (customStageDeviceVolume ? customStageDeviceVolume.muted : stageDevice.muted) ||
                (customStageMemberVolume ? customStageMemberVolume.muted : stageMember.muted) ||
                (customGroupVolume ? customGroupVolume.muted : group.muted)
            setVolume({
                volume: calculatedVolume,
                muted,
            })
        }
    }, [
        group,
        customGroupVolume,
        stageMember,
        customStageMemberVolume,
        stageDevice,
        customStageDeviceVolume,
    ])
    return {
        position,
        volume,
    }
}

export default reduceStageDevicePosition

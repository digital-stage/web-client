import { useEffect, useState } from 'react'
import ThreeDimensionalProperties from '@digitalstage/api-types/dist/model/ThreeDimensionalProperties'
import {
    CustomStageDevicePosition,
    DefaultThreeDimensionalProperties,
    StageDevice,
    StageMember,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { CustomGroupPosition, CustomStageMemberPosition, Group } from '@digitalstage/api-types'

const reducePosition = ({
    stageDeviceId,
    deviceId,
}: {
    stageDeviceId: string
    deviceId: string
}) => {
    const [position, setPosition] = useState<ThreeDimensionalProperties>(
        DefaultThreeDimensionalProperties
    )
    // Fetch necessary model
    const stageDevice = useStageSelector<StageDevice>(
        (state) => stageDeviceId && state.stageDevices.byId[stageDeviceId]
    )
    const customStageDevicePosition = useStageSelector<CustomStageDevicePosition | undefined>(
        (state) =>
            state.customStageDevicePositions.byDeviceAndStageDevice[deviceId] &&
            state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDevice._id] &&
            state.customStageDevicePositions.byId[
                state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDevice._id]
            ]
    )
    const stageMember = useStageSelector<StageMember>(
        (state) => stageDevice && state.stageMembers.byId[stageDevice.stageMemberId]
    )
    const customStageMemberPosition = useStageSelector<CustomStageMemberPosition | undefined>(
        (state) =>
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId][stageMember._id] &&
            state.customStageMemberPositions.byId[
                state.customStageMemberPositions.byDeviceAndStageMember[deviceId][stageMember._id]
            ]
    )
    const group = useStageSelector<Group>(
        (state) => stageMember && state.groups.byId[stageMember.groupId]
    )
    const customGroupPosition = useStageSelector<CustomGroupPosition | undefined>(
        (state) =>
            state.customGroupPositions.byDeviceAndGroup[deviceId] &&
            state.customGroupPositions.byDeviceAndGroup[deviceId][group._id] &&
            state.customGroupPositions.byId[
                state.customGroupPositions.byDeviceAndGroup[deviceId][group._id]
            ]
    )

    // Calculate position
    useEffect(() => {
        // Only calculate if ready and the default entities are available
        if (group && stageMember && stageDevice) {
            setPosition({
                x:
                    (customGroupPosition?.x || group.x) +
                    (customStageMemberPosition?.x || stageMember.x) +
                    (customStageDevicePosition?.x || stageDevice.x),
                y:
                    (customGroupPosition?.y || group.y) +
                    (customStageMemberPosition?.y || stageMember.y) +
                    (customStageDevicePosition?.y || stageDevice.y),
                z:
                    (customGroupPosition?.z || group.z) +
                    (customStageMemberPosition?.z || stageMember.z) +
                    (customStageDevicePosition?.z || stageDevice.z),
                rX:
                    (customGroupPosition?.rX || group.rX) +
                    (customStageMemberPosition?.rX || stageMember.rX) +
                    (customStageDevicePosition?.rX || stageDevice.rX),
                rY:
                    (customGroupPosition?.rY || group.rY) +
                    (customStageMemberPosition?.rY || stageMember.rY) +
                    (customStageDevicePosition?.rY || stageDevice.rY),
                rZ:
                    (customGroupPosition?.rZ || group.rZ) +
                    (customStageMemberPosition?.rZ || stageMember.rZ) +
                    (customStageDevicePosition?.rZ || stageDevice.rZ),
                directivity: customGroupPosition?.directivity || group.directivity,
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

    return position
}
export default reducePosition

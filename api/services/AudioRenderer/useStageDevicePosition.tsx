import { useEffect, useState } from 'react'
import {
    CustomGroupPosition,
    CustomStageDevicePosition,
    CustomStageMemberPosition,
    DefaultThreeDimensionalProperties,
    Group,
    StageDevice,
    StageMember,
    ThreeDimensionalProperties,
} from '@digitalstage/api-types'
import { useStageSelector } from 'api/redux/selectors/useStageSelector'
import { shallowEqual } from 'react-redux'

const useStageDevicePosition = ({
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
        (state) => state.stageDevices.byId[stageDeviceId],
        shallowEqual
    )
    const customStageDevicePosition = useStageSelector<CustomStageDevicePosition | undefined>(
        (state) =>
            state.customStageDevicePositions.byDeviceAndStageDevice[deviceId] &&
            state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][stageDevice._id]
                ? state.customStageDevicePositions.byId[
                      state.customStageDevicePositions.byDeviceAndStageDevice[deviceId][
                          stageDevice._id
                      ]
                  ]
                : undefined,
        shallowEqual
    )
    const stageMember = useStageSelector<StageMember>(
        (state) => stageDevice && state.stageMembers.byId[stageDevice.stageMemberId],
        shallowEqual
    )
    const customStageMemberPosition = useStageSelector<CustomStageMemberPosition | undefined>(
        (state) =>
            stageMember &&
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberPositions.byDeviceAndStageMember[deviceId][stageMember._id]
                ? state.customStageMemberPositions.byId[
                      state.customStageMemberPositions.byDeviceAndStageMember[deviceId][
                          stageMember._id
                      ]
                  ]
                : undefined,
        shallowEqual
    )
    const group = useStageSelector<Group>(
        (state) => stageMember && state.groups.byId[stageMember.groupId]
    )
    const customGroupPosition = useStageSelector<CustomGroupPosition | undefined>(
        (state) =>
            group &&
            state.customGroupPositions.byDeviceAndGroup[deviceId] &&
            state.customGroupPositions.byDeviceAndGroup[deviceId][group._id]
                ? state.customGroupPositions.byId[
                      state.customGroupPositions.byDeviceAndGroup[deviceId][group._id]
                  ]
                : undefined,
        shallowEqual
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
export { useStageDevicePosition }

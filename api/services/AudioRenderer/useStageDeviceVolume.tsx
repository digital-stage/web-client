import React from 'react'
import {
    DefaultVolumeProperties, VolumeProperties,
} from '@digitalstage/api-types'
import {useStageSelector} from 'api/redux/selectors/useStageSelector'

const useStageDeviceVolume = ({
                                  stageDeviceId,
                                  deviceId,
                              }: {
    stageDeviceId: string
    deviceId: string
}): VolumeProperties => {
    const [state, setState] = React.useState<VolumeProperties>(DefaultVolumeProperties)
    // Fetch necessary model
    const stageDeviceVolume = useStageSelector<number | undefined>(
        (state) =>
            state.stageDevices.byId[stageDeviceId] &&
            state.stageDevices.byId[stageDeviceId].volume
    )
    const stageDeviceMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.stageDevices.byId[stageDeviceId] &&
            state.stageDevices.byId[stageDeviceId].muted
    )
    const customStageDeviceVolume = useStageSelector<number | undefined>(
        (state) =>
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][
                    stageDeviceId
                    ]
                ].volume
    )
    const customStageDeviceMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][
                    stageDeviceId
                    ]
                ].muted
    )
    const stageMemberVolume = useStageSelector<number | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId] && state.stageMembers.byId[state.stageDevices.byId[stageDeviceId].stageMemberId].volume,
    )
    const stageMemberMuted = useStageSelector<boolean | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId] && state.stageMembers.byId[state.stageDevices.byId[stageDeviceId].stageMemberId].muted,
    )
    const customStageMemberVolume = useStageSelector<number | undefined>(
        (state) =>
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageDeviceId] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][
                    stageDeviceId
                    ]
                ].volume
    )
    const customStageMemberMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageDeviceId] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][
                    stageDeviceId
                    ]
                ].muted
    )
    const groupVolume = useStageSelector<number | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId].groupId && state.groups.byId[state.stageDevices.byId[stageDeviceId].groupId].volume
    )
    const groupMuted = useStageSelector<boolean | undefined>(
        (state) => state.stageDevices.byId[stageDeviceId].groupId && state.groups.byId[state.stageDevices.byId[stageDeviceId].groupId].muted
    )
    const customGroupVolume = useStageSelector<number | undefined>(
        (state) =>
            state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[deviceId][stageDeviceId] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[deviceId][
                    stageDeviceId
                    ]
                ].volume
    )
    const customGroupMuted = useStageSelector<boolean | undefined>(
        (state) =>
            state.stageDevices.byId[stageDeviceId]?.groupId &&
            state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[deviceId][state.stageDevices.byId[stageDeviceId].groupId] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[deviceId][state.stageDevices.byId[stageDeviceId].groupId]].muted
    )

    // Calculate position
    React.useEffect(() => {
        setState({
            volume: groupVolume * stageMemberVolume * stageDeviceVolume,
            muted: groupMuted || stageMemberMuted || stageDeviceMuted
        })
    }, [groupMuted, groupVolume, stageDeviceMuted, stageDeviceVolume, stageMemberMuted, stageMemberVolume])

    return state
}
export {useStageDeviceVolume}

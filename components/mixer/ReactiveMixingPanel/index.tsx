import {
    clientActions,
    selectMode, sortStageMembers,
    useCurrentStageAdminSelector,
    useEmit, useFilteredStageMembers,
    useStageSelector,
} from '@digitalstage/api-client-react'
import React from 'react'
import {VolumeSlider} from './VolumeSlider'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import {TextSwitch} from 'ui/TextSwitch'
import { DefaultVolumeProperties } from '@digitalstage/api-types'
import { useDispatch } from 'react-redux'

const BiChevronDown = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M16.293 9.293L12 13.586 7.707 9.293 6.293 10.707 12 16.414 17.707 10.707z" />
    </svg>
)

const BiChevronUp = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 24 24"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M6.293 13.293L7.707 14.707 12 10.414 16.293 14.707 17.707 13.293 12 7.586z" />
    </svg>
)
const AudioTrackPanel = ({
    audioTrackId,
    deviceId,
}: {
    audioTrackId: string
    deviceId?: string
}) => {
    const emit = useEmit()
    const audioTrack = useStageSelector((state) => state.audioTracks.byId[audioTrackId])
    const customAudioTrack = useStageSelector((state) =>
        deviceId &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
            ? state.customAudioTrackVolumes.byId[
                  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
              ]
            : undefined
    )
    const updateVolume = React.useCallback(
        (volume: number, muted: boolean) => {
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
                    audioTrackId,
                    deviceId,
                    volume,
                    muted,
                } as ClientDevicePayloads.SetCustomAudioTrackVolume)
            } else {
                emit(ClientDeviceEvents.ChangeAudioTrack, {
                    _id: audioTrackId,
                    volume,
                    muted,
                } as ClientDevicePayloads.ChangeAudioTrack)
            }
        },
        [emit, deviceId, audioTrackId]
    )
    const resetVolume = React.useCallback(() => {
        if (customAudioTrack) {
            emit(ClientDeviceEvents.RemoveCustomAudioTrackVolume, customAudioTrack._id)
        } else {
            emit(ClientDeviceEvents.ChangeAudioTrack, {
                _id: audioTrackId,
                ...DefaultVolumeProperties,
            })
        }
    }, [audioTrackId, emit, customAudioTrack])
    return (
        <div className="audioTrack">
            <VolumeSlider
                id={audioTrackId}
                volume={customAudioTrack?.volume || audioTrack.volume}
                muted={customAudioTrack ? customAudioTrack.muted : audioTrack.muted}
                name={audioTrackId}
                modified={
                    (!deviceId && (audioTrack.volume !== 1 || audioTrack.muted)) ||
                    !!customAudioTrack
                }
                onChange={updateVolume}
                onReset={resetVolume}
            />
        </div>
    )
}

const StageDevicePanel = ({
    stageDeviceId,
    deviceId,
}: {
    stageDeviceId: string
    deviceId?: string
}) => {
    const emit = useEmit()
    const [expanded, setExpanded] = React.useState<boolean>(false)
    const audioTrackIds = useStageSelector(
        (state) => state.audioTracks.byStageDevice[stageDeviceId] || []
    )
    const stageDevice = useStageSelector((state) => state.stageDevices.byId[stageDeviceId])
    const customStageDevice = useStageSelector((state) =>
        deviceId &&
        state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
        state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
            ? state.customStageDeviceVolumes.byId[
                  state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
              ]
            : undefined
    )
    const updateVolume = React.useCallback(
        (volume: number, muted: boolean) => {
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomStageDeviceVolume, {
                    stageDeviceId,
                    deviceId,
                    volume,
                    muted,
                } as ClientDevicePayloads.SetCustomStageDeviceVolume)
            } else {
                emit(ClientDeviceEvents.ChangeStageDevice, {
                    _id: stageDeviceId,
                    volume,
                    muted,
                } as ClientDevicePayloads.ChangeStageDevice)
            }
        },
        [emit, deviceId, stageDeviceId]
    )
    const resetVolume = React.useCallback(() => {
        if (customStageDevice) {
            emit(ClientDeviceEvents.RemoveCustomStageDeviceVolume, customStageDevice._id)
        } else {
            emit(ClientDeviceEvents.ChangeStageDevice, {
                _id: stageDeviceId,
                ...DefaultVolumeProperties,
            })
        }
    }, [emit, customStageDevice, stageDeviceId])
    return (
        <div className="stageDevice">
            <div
                className={`sliderRow ${
                    audioTrackIds.length > 0 ? 'sliderRowExpandable' : ''
                }`}
            >
                <VolumeSlider
                    id={stageDeviceId}
                    volume={customStageDevice?.volume || stageDevice.volume}
                    muted={customStageDevice ? customStageDevice.muted : stageDevice.muted}
                    name={stageDevice.name}
                    modified={
                        (!deviceId && (stageDevice.volume !== 1 || stageDevice.muted)) ||
                        !!customStageDevice
                    }
                    onChange={updateVolume}
                    onReset={resetVolume}
                />
                {audioTrackIds.length > 0 ? (
                    <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
                        {expanded ? <BiChevronUp /> : <BiChevronDown />}
                    </div>
                ) : null}
            </div>
            {audioTrackIds.length > 0 ? (
                <div className={`expandable ${expanded ? 'expanded' : ''}`}>
                    {audioTrackIds.map((audioTrackId) => (
                        <AudioTrackPanel
                            key={audioTrackId}
                            deviceId={deviceId}
                            audioTrackId={audioTrackId}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const StageMemberPanel = ({
    stageMemberId,
    deviceId,
}: {
    stageMemberId: string
    deviceId?: string
}) => {
    const emit = useEmit()
    const [expanded, setExpanded] = React.useState<boolean>(false)
    const stageDeviceIds = useStageSelector(
        (state) => state.stageDevices.byStageMember[stageMemberId] || []
    )
    const stageMember = useStageSelector((state) => state.stageMembers.byId[stageMemberId])
    const user = useStageSelector((state) => state.users.byId[stageMember.userId])
    const customStageMember = useStageSelector((state) =>
        deviceId &&
        state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
        state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
            ? state.customStageMemberVolumes.byId[
                  state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
              ]
            : undefined
    )
    const updateVolume = React.useCallback(
        (volume: number, muted: boolean) => {
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomStageMemberVolume, {
                    stageMemberId,
                    deviceId,
                    volume,
                    muted,
                } as ClientDevicePayloads.SetCustomStageMemberVolume)
            } else {
                emit(ClientDeviceEvents.ChangeStageMember, {
                    _id: stageMemberId,
                    volume,
                    muted,
                } as ClientDevicePayloads.ChangeStageMember)
            }
        },
        [emit, deviceId, stageMemberId]
    )
    const resetVolume = React.useCallback(() => {
        if (customStageMember) {
            emit(ClientDeviceEvents.RemoveCustomStageMemberVolume, customStageMember._id)
        } else {
            emit(ClientDeviceEvents.ChangeStageMember, {
                _id: stageMemberId,
                ...DefaultVolumeProperties,
            })
        }
    }, [emit, customStageMember, stageMemberId])
    return (
        <div className="stageMember">
            <div
                className={`sliderRow ${
                    stageDeviceIds.length > 0 ? 'sliderRowExpandable' : ''
                }`}
            >
                <VolumeSlider
                    id={stageMemberId}
                    name={user.name}
                    volume={customStageMember?.volume || stageMember.volume}
                    muted={customStageMember ? customStageMember.muted : stageMember.muted}
                    modified={
                        (!deviceId && (stageMember.volume !== 1 || stageMember.muted)) ||
                        !!customStageMember
                    }
                    onChange={updateVolume}
                    onReset={resetVolume}
                />
                {stageDeviceIds.length > 0 ? (
                    <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
                        {expanded ? <BiChevronUp /> : <BiChevronDown />}
                    </div>
                ) : null}
            </div>
            {stageDeviceIds.length > 0 && expanded ? (
                <div className="children">
                    {stageDeviceIds.map((stageDeviceId) => (
                        <StageDevicePanel
                            key={stageDeviceId}
                            deviceId={deviceId}
                            stageDeviceId={stageDeviceId}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const GroupPanel = ({ groupId, deviceId }: { groupId: string; deviceId?: string }) => {
    const emit = useEmit()
    const [expanded, setExpanded] = React.useState<boolean>(true)
    const stageMemberIds = useStageSelector(state => {
            if (state.globals.showOffline) {
                return [...state.stageMembers.byGroup[groupId]].sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
            }
            return state.stageMembers.byGroup[groupId].filter(id => state.stageMembers.byId[id].active).sort((a, b) => sortStageMembers(state.stageMembers.byId[a], state.stageMembers.byId[b]))
    })
    const group = useStageSelector((state) => state.groups.byId[groupId])
    const customGroup = useStageSelector((state) =>
        deviceId &&
        state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
        state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
            ? state.customGroupVolumes.byId[
                  state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
              ]
            : undefined
    )
    const updateVolume = React.useCallback(
        (volume: number, muted: boolean) => {
            if (deviceId) {
                emit(ClientDeviceEvents.SetCustomGroupVolume, {
                    groupId,
                    deviceId,
                    volume,
                    muted,
                } as ClientDevicePayloads.SetCustomGroupVolume)
            } else {
                emit(ClientDeviceEvents.ChangeGroup, {
                    _id: groupId,
                    volume,
                    muted,
                } as ClientDevicePayloads.ChangeGroup)
            }
        },
        [emit, deviceId, groupId]
    )
    const resetVolume = React.useCallback(() => {
        if (customGroup) {
            emit(ClientDeviceEvents.RemoveCustomGroupVolume, customGroup._id)
        } else {
            emit(ClientDeviceEvents.ChangeGroup, {
                _id: groupId,
                ...DefaultVolumeProperties,
            })
        }
    }, [emit, customGroup, groupId])
    return (
        <div
            className="group"
            style={{
                borderColor: group.color,
                color: group.color,
            }}
        >
            <div className={`sliderRow sliderRowExpandable`}>
                <VolumeSlider
                    id={groupId}
                    volume={customGroup?.volume || group.volume}
                    muted={customGroup ? customGroup.muted : group.muted}
                    name={group.name}
                    modified={(!deviceId && (group.volume !== 1 || group.muted)) || !!customGroup}
                    onChange={updateVolume}
                    onReset={resetVolume}
                />
                {stageMemberIds.length > 0 ? (
                    <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
                        {expanded ? <BiChevronUp /> : <BiChevronDown />}
                    </div>
                ) : null}
            </div>
            {stageMemberIds.length > 0 && expanded ? (
                <div className="children">
                    {stageMemberIds.map((stageMemberId) => (
                        <StageMemberPanel
                            key={stageMemberId}
                            deviceId={deviceId}
                            stageMemberId={stageMemberId}
                        />
                    ))}
                </div>
            ) : null}
        </div>
    )
}

const ResetAllButton = ({ deviceId }: { deviceId?: string }) => {
    const emit = useEmit()
    const groupIds = useStageSelector((state) => state.groups.allIds)
    const stageMemberIds = useStageSelector((state) => state.stageMembers.allIds)
    const stageDeviceIds = useStageSelector((state) => state.stageDevices.allIds)
    const audioTracksIds = useStageSelector((state) => state.audioTracks.allIds)
    const customGroupIds = useStageSelector((state) =>
        deviceId && state.customGroupVolumes.byDevice[deviceId]
            ? state.customGroupVolumes.byDevice[deviceId]
            : []
    )
    const customStageMemberIds = useStageSelector((state) =>
        deviceId && state.customStageMemberVolumes.byDevice[deviceId]
            ? state.customStageMemberVolumes.byDevice[deviceId]
            : []
    )
    const customStageDeviceIds = useStageSelector((state) =>
        deviceId && state.customStageDeviceVolumes.byDevice[deviceId]
            ? state.customStageDeviceVolumes.byDevice[deviceId]
            : []
    )
    const customAudioTrackIds = useStageSelector((state) =>
        deviceId && state.customAudioTrackVolumes.byDevice[deviceId]
            ? state.customAudioTrackVolumes.byDevice[deviceId]
            : []
    )
    const resetAll = React.useCallback(() => {
        if (emit) {
            if (deviceId) {
                customGroupIds.map((id) => emit(ClientDeviceEvents.RemoveCustomGroupVolume, id))
                customStageMemberIds.map((id) =>
                    emit(ClientDeviceEvents.RemoveCustomStageMemberVolume, id)
                )
                customStageDeviceIds.map((id) =>
                    emit(ClientDeviceEvents.RemoveCustomStageDeviceVolume, id)
                )
                customAudioTrackIds.map((id) =>
                    emit(ClientDeviceEvents.RemoveCustomAudioTrackVolume, id)
                )
            } else {
                groupIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeGroup, {
                        _id: id,
                        ...DefaultVolumeProperties,
                    } as ClientDevicePayloads.ChangeGroup)
                )
                stageMemberIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: id,
                        ...DefaultVolumeProperties,
                    } as ClientDevicePayloads.ChangeStageMember)
                )
                stageDeviceIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeStageDevice, {
                        _id: id,
                        ...DefaultVolumeProperties,
                    } as ClientDevicePayloads.ChangeStageDevice)
                )
                audioTracksIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeAudioTrack, {
                        _id: id,
                        ...DefaultVolumeProperties,
                    } as ClientDevicePayloads.ChangeAudioTrack)
                )
            }
        }
    }, [
        audioTracksIds,
        customAudioTrackIds,
        customGroupIds,
        customStageDeviceIds,
        customStageMemberIds,
        deviceId,
        emit,
        groupIds,
        stageDeviceIds,
        stageMemberIds,
    ])
    return (
        <button onClick={resetAll} className="danger">
            Alles zurücksetzen
        </button>
    )
}

const StagePanel = ({ stageId }: { stageId: string }) => {
    const dispatch = useDispatch()
    const selectedDeviceId = useStageSelector((state) => state.globals.selectedDeviceId)
    const selectedMode = useStageSelector((state) => state.globals.selectedMode)
    const isStageAdmin = useCurrentStageAdminSelector()
    const groupIds = useStageSelector((state) => state.groups.byStage[stageId])
    const showOffline = useStageSelector(state => state.globals.showOffline)
    const onOfflineToggle = React.useCallback(() => {
        dispatch(clientActions.showOffline(!showOffline))
    }, [dispatch, showOffline])
    return (
        <div className="mixingLayout">
            {isStageAdmin ? (
                <TextSwitch
                    className="switch"
                    value={selectedMode}
                    onSelect={(v) => {
                        dispatch(selectMode(v === 'global' ? 'global' : 'personal'))
                    }}
                >
                    <span key="personal">Persönliche Einstellungen</span>
                    <span key="global">Voreinstellungen</span>
                </TextSwitch>
            ) : null}
            {groupIds.map((groupId) => (
                <GroupPanel
                    key={groupId}
                    deviceId={selectedMode === 'global' ? undefined : selectedDeviceId}
                    groupId={groupId}
                />
            ))}
            <div className="mixingLayoutActions">
                <ResetAllButton deviceId={selectedMode === 'global' ? undefined : selectedDeviceId} />
                <button className="" onClick={onOfflineToggle}>
                    {showOffline ? 'Inaktive ausblenden' : 'Inaktive einblenden'}
                </button>
            </div>
        </div>
    )
}

const ReactiveMixingPanel = () => {
    const stageId = useStageSelector((state) => state.globals.stageId)

    if (stageId) {
        return <StagePanel stageId={stageId} />
    }
    return <div>Not inside any stage</div>
}
export { ReactiveMixingPanel }

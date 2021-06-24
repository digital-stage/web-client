import {
    CustomAudioTrackVolume,
    CustomStageDeviceVolume,
    StageDevice,
    StageMember,
    useConnection,
    User,
    useStageSelector,
} from '@digitalstage/api-client-react'
import {
    AudioTrack,
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomGroupVolume,
    CustomStageMemberVolume,
    Group,
} from '@digitalstage/api-types'
import React, { useEffect, useState, useCallback } from 'react'
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io'
import styles from './MixingPanel.module.css'
import useColors from '../../../lib/useColors'
import HSLColor from '../../../lib/useColors/HSLColor'

import ChannelStrip from './ChannelStrip'
import useSelectedDevice from '../../../lib/useSelectedDevice'
import HeadlineButton from '../../../fastui/components/interaction/HeadlineButton'
import DeviceSelector from '../../DeviceSelector'
import useLevel from '../../../api-client-react/src/hooks/useLevel'

const AudioTrackPanel = (props: { id: string; color: HSLColor; globalMode: boolean }) => {
    const { id, color, globalMode } = props
    const { selectedDeviceId } = useSelectedDevice()
    const audioTrack = useStageSelector<AudioTrack>((state) => state.audioTracks.byId[id])
    const customized = useStageSelector<CustomAudioTrackVolume | undefined>(
        (state) =>
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[selectedDeviceId] &&
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[selectedDeviceId][id] &&
            state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[selectedDeviceId][id]
            ]
    )
    const connection = useConnection()
    const { levels } = useLevel()

    const handleChange = useCallback(
        (volume: number, muted: boolean) => {
            if (connection) {
                if (globalMode) {
                    return connection.emit(ClientDeviceEvents.ChangeAudioTrack, {
                        _id: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.ChangeAudioTrack)
                }
                if (selectedDeviceId)
                    return connection.emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
                        deviceId: selectedDeviceId,
                        audioTrackId: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.SetCustomAudioTrackVolume)
            }
            return null
        },
        [selectedDeviceId, connection, globalMode]
    )

    const handleReset = useCallback(() => {
        if (connection) {
            if (globalMode) {
                return connection.emit(ClientDeviceEvents.ChangeAudioTrack, {
                    _id: id,
                    volume: 1,
                    muted: false,
                } as ClientDevicePayloads.ChangeAudioTrack)
            }
            if (customized) {
                return connection.emit(
                    ClientDeviceEvents.RemoveCustomAudioTrackVolume,
                    customized._id as ClientDevicePayloads.RemoveCustomAudioTrackVolume
                )
            }
        }
        return null
    }, [connection, globalMode, customized])

    return (
        <div className={styles.panel}>
            <div className={`${styles.strip} ${styles.audioTrackStrip}`}>
                <h5 className={styles.stripHeadline}>{audioTrack.type}</h5>
                <ChannelStrip
                    className={styles.channelStrip}
                    channel={globalMode ? audioTrack : customized || audioTrack}
                    resettable={
                        (globalMode && (audioTrack.volume !== 1 || audioTrack.muted)) ||
                        !!customized
                    }
                    onReset={handleReset}
                    onChange={handleChange}
                    color={color.toString()}
                    levelBuffer={levels[id]}
                />
            </div>
        </div>
    )
}
const StageDevicePanel = (props: { id: string; color: HSLColor; globalMode: boolean }) => {
    const { id, color, globalMode } = props
    const { selectedDeviceId } = useSelectedDevice()
    const stageDevice = useStageSelector<StageDevice>((state) => state.stageDevices.byId[id])
    const customized = useStageSelector<CustomStageDeviceVolume | undefined>(
        (state) =>
            state.customStageDeviceVolumes.byDeviceAndStageDevice[selectedDeviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[selectedDeviceId][id] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[selectedDeviceId][id]
            ]
    )
    const audioTrackIds = useStageSelector<string[]>(
        (state) => state.audioTracks.byStageDevice[id] || []
    )
    const [expanded, setExpanded] = useState<boolean>(false)
    const connection = useConnection()
    const { levels } = useLevel()

    useEffect(() => {
        if (audioTrackIds.length === 0) {
            setExpanded(false)
        }
    }, [audioTrackIds.length])

    const handleChange = useCallback(
        (volume: number, muted: boolean) => {
            if (connection) {
                if (globalMode) {
                    return connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                        _id: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.ChangeStageDevice)
                }
                if (selectedDeviceId)
                    return connection.emit(ClientDeviceEvents.SetCustomStageDeviceVolume, {
                        deviceId: selectedDeviceId,
                        stageDeviceId: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.SetCustomStageDeviceVolume)
            }
            return null
        },
        [selectedDeviceId, connection, globalMode]
    )

    const handleReset = useCallback(() => {
        if (connection) {
            if (globalMode) {
                return connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                    _id: id,
                    volume: 1,
                    muted: false,
                } as ClientDevicePayloads.ChangeStageDevice)
            }
            if (customized) {
                return connection.emit(
                    ClientDeviceEvents.RemoveCustomStageDeviceVolume,
                    customized._id as ClientDevicePayloads.RemoveCustomStageDeviceVolume
                )
            }
        }
        return null
    }, [connection, globalMode, customized])

    return (
        <div className={styles.panel}>
            <div className={`${styles.strip} ${styles.stageDeviceStrip}`}>
                {audioTrackIds.length > 0 ? (
                    <div
                        className={styles.stripExpander}
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-hidden="true"
                    >
                        <h5 className={styles.stripHeadline}>{stageDevice.name}</h5>
                        <div
                            className={styles.stripExpanderButton}
                            style={{
                                backgroundColor: color.toString(),
                            }}
                        >
                            {expanded ? (
                                <IoIosArrowBack size={24} />
                            ) : (
                                <IoIosArrowForward size={24} />
                            )}
                        </div>
                    </div>
                ) : (
                    <h5 className={styles.stripHeadline}>{stageDevice.name}</h5>
                )}
                <ChannelStrip
                    className={styles.channelStrip}
                    channel={globalMode ? stageDevice : customized || stageDevice}
                    resettable={
                        (globalMode && (stageDevice.volume !== 1 || stageDevice.muted)) ||
                        !!customized
                    }
                    onReset={handleReset}
                    onChange={handleChange}
                    color={color.toString()}
                    levelBuffer={levels[id]}
                />
            </div>
            {expanded && (
                <div className={`${styles.row} ${styles.audioTrackRow}`}>
                    {audioTrackIds.map((audioTrackId) => (
                        <AudioTrackPanel
                            key={audioTrackId}
                            id={audioTrackId}
                            globalMode={globalMode}
                            color={color}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
const StageMemberPanel = (props: { id: string; globalMode: boolean }) => {
    const { id, globalMode } = props
    const { selectedDeviceId } = useSelectedDevice()
    const stageMember = useStageSelector<StageMember | undefined>(
        (state) => state.stageMembers.byId[id]
    )
    const user = useStageSelector<User | undefined>(
        (state) => stageMember && state.users.byId[stageMember.userId]
    )
    const stageDeviceIds = useStageSelector<string[]>(
        (state) => state.stageDevices.byStageMember[id] || []
    )
    const customized = useStageSelector<CustomStageMemberVolume | undefined>(
        (state) =>
            state.customStageMemberVolumes.byDeviceAndStageMember[selectedDeviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[selectedDeviceId][id] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[selectedDeviceId][id]
            ]
    )
    const [expanded, setExpanded] = useState<boolean>(false)
    const color = useColors(id)
    const connection = useConnection()
    const { levels } = useLevel()

    useEffect(() => {
        if (stageDeviceIds.length === 0) {
            setExpanded(false)
        }
    }, [stageDeviceIds.length])

    const handleChange = useCallback(
        (volume: number, muted: boolean) => {
            if (connection) {
                if (globalMode) {
                    return connection.emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.ChangeStageMember)
                }
                if (selectedDeviceId)
                    return connection.emit(ClientDeviceEvents.SetCustomStageMemberVolume, {
                        deviceId: selectedDeviceId,
                        stageMemberId: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.SetCustomStageMemberVolume)
            }
            return null
        },
        [selectedDeviceId, connection, globalMode]
    )

    const handleReset = useCallback(() => {
        if (connection) {
            if (globalMode) {
                return connection.emit(ClientDeviceEvents.ChangeStageMember, {
                    _id: id,
                    volume: 1,
                    muted: false,
                } as ClientDevicePayloads.ChangeStageMember)
            }
            if (customized) {
                return connection.emit(
                    ClientDeviceEvents.RemoveCustomStageMemberVolume,
                    customized._id as ClientDevicePayloads.RemoveCustomStageMemberVolume
                )
            }
        }
        return null
    }, [selectedDeviceId, connection, globalMode, customized])

    return (
        <div className={styles.panel}>
            <div className={`${styles.strip} ${styles.stageMemberStrip}`}>
                {stageDeviceIds.length > 0 ? (
                    <div
                        className={styles.stripExpander}
                        onClick={() => setExpanded((prev) => !prev)}
                        aria-hidden="true"
                    >
                        <h5 className={styles.stripHeadline}>{user?.name || stageMember._id}</h5>
                        <div
                            className={styles.stripExpanderButton}
                            style={{
                                backgroundColor: color?.toString(),
                            }}
                        >
                            {expanded ? (
                                <IoIosArrowBack size={24} />
                            ) : (
                                <IoIosArrowForward size={24} />
                            )}
                        </div>
                    </div>
                ) : (
                    <h5 className={styles.stripHeadline}>{user?.name || stageMember._id}</h5>
                )}
                <ChannelStrip
                    className={styles.channelStrip}
                    channel={globalMode ? stageMember : customized || stageMember}
                    resettable={
                        (globalMode && (stageMember.volume !== 1 || stageMember.muted)) ||
                        !!customized
                    }
                    onReset={handleReset}
                    onChange={handleChange}
                    color={color?.toString()}
                    levelBuffer={levels[id]}
                />
            </div>
            {expanded && (
                <div className={`${styles.row} ${styles.stageDeviceRow}`}>
                    {stageDeviceIds.map((stageDeviceId) => (
                        <StageDevicePanel
                            key={stageDeviceId}
                            id={stageDeviceId}
                            globalMode={globalMode}
                            color={color}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
const GroupPanel = (props: { id: string; globalMode: boolean }) => {
    const { id, globalMode } = props
    const { selectedDeviceId } = useSelectedDevice()
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const customized = useStageSelector<CustomGroupVolume | undefined>(
        (state) =>
            selectedDeviceId &&
            state.customGroupVolumes.byDeviceAndGroup[selectedDeviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[selectedDeviceId][id] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[selectedDeviceId][id]
            ]
    )
    const stageMemberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[id] || []
    )
    const [expanded, setExpanded] = useState<boolean>(false)
    const connection = useConnection()
    const { levels } = useLevel()

    const handleChange = useCallback(
        (volume: number, muted: boolean) => {
            if (connection) {
                if (globalMode) {
                    return connection.emit(ClientDeviceEvents.ChangeGroup, {
                        _id: id,
                        volume,
                        muted,
                    } as ClientDevicePayloads.ChangeGroup)
                }
                if (selectedDeviceId)
                    return connection.emit(ClientDeviceEvents.SetCustomGroupVolume, {
                        groupId: id,
                        deviceId: selectedDeviceId,
                        volume,
                        muted,
                    } as ClientDevicePayloads.SetCustomGroupVolume)
            }
            return null
        },
        [selectedDeviceId, connection, globalMode]
    )

    const handleReset = useCallback(() => {
        if (connection) {
            if (globalMode) {
                return connection.emit(ClientDeviceEvents.ChangeGroup, {
                    _id: id,
                    volume: 1,
                    muted: false,
                } as ClientDevicePayloads.ChangeGroup)
            }
            if (customized) {
                return connection.emit(
                    ClientDeviceEvents.RemoveCustomGroupVolume,
                    customized._id as ClientDevicePayloads.RemoveCustomGroupVolume
                )
            }
        }
        return null
    }, [connection, globalMode, customized])

    useEffect(() => {
        if (stageMemberIds.length === 0) {
            setExpanded(false)
        }
    }, [stageMemberIds.length])

    return (
        <div
            className={`${styles.panel} ${styles.groupPanel}`}
            style={{
                borderColor: group.color,
            }}
        >
            <div className={`${styles.strip} ${styles.groupStrip}`}>
                {stageMemberIds.length > 0 ? (
                    <div
                        aria-hidden="true"
                        className={styles.stripExpander}
                        onClick={() => setExpanded((prev) => !prev)}
                    >
                        <h5 className={styles.stripHeadline}>{group.name}</h5>
                        <div
                            className={styles.stripExpanderButton}
                            style={{
                                backgroundColor: group.color,
                            }}
                        >
                            {expanded ? (
                                <IoIosArrowBack size={24} />
                            ) : (
                                <IoIosArrowForward size={24} />
                            )}
                        </div>
                    </div>
                ) : (
                    <h5 className={styles.stripHeadline}>{group.name}</h5>
                )}
                <ChannelStrip
                    className={styles.channelStrip}
                    channel={globalMode ? group : customized || group}
                    resettable={(globalMode && (group.volume !== 1 || group.muted)) || !!customized}
                    onReset={handleReset}
                    onChange={handleChange}
                    color={group.color}
                    levelBuffer={levels[id]}
                />
            </div>
            {expanded && (
                <div className={`${styles.row} ${styles.stageMemberRow}`}>
                    {stageMemberIds.map((stageMemberId) => (
                        <StageMemberPanel
                            key={stageMemberId}
                            id={stageMemberId}
                            globalMode={globalMode}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const MixingPanel = () => {
    const isReady = useStageSelector<boolean>((state) => state.globals.ready)
    const isInsideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const groupIds = useStageSelector<string[]>((state) => state.groups.allIds)
    const isSoundEditor = useStageSelector<boolean>(
        (state) =>
            state.globals.localUserId &&
            state.globals.stageId &&
            state.stages.byId[state.globals.stageId].soundEditors.some(
                (admin) => admin === state.globals.localUserId
            )
    )
    const [globalMode, setGlobalMode] = useState<boolean>(false)

    if (isReady && isInsideStage) {
        return (
            <div className={styles.wrapper}>
                {isSoundEditor && (
                    <div className="vertical">
                        <div>
                            <HeadlineButton
                                toggled={!globalMode}
                                onClick={() => setGlobalMode(false)}
                            >
                                Persönliche Einstellungen
                            </HeadlineButton>
                            <HeadlineButton
                                toggled={globalMode}
                                onClick={() => setGlobalMode(true)}
                            >
                                Voreinstellungen
                            </HeadlineButton>
                        </div>
                        <div>
                            <p className="micro">
                                {globalMode
                                    ? 'Diese Einstellungen gelten als Voreinstellung für alle'
                                    : 'Diese Einstellungen gelten nur für Dich'}
                            </p>
                        </div>
                    </div>
                )}
                {!globalMode && (
                    <div>
                        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                        <label className="micro">
                            Betreffendes Gerät:&nbsp;&nbsp;
                            <DeviceSelector />
                        </label>
                    </div>
                )}
                <div className={styles.inner}>
                    {groupIds.map((groupId) => (
                        <div key={groupId} className={styles.groupWrapper}>
                            <GroupPanel id={groupId} globalMode={globalMode} />
                        </div>
                    ))}
                </div>
            </div>
        )
    }
    return null
}
export default MixingPanel

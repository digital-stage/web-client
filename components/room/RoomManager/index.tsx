/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    useConnection,
    Stage,
    useStageSelector,
    StageMember,
    StageDevices,
    RemoteUsers,
    CustomStageMemberPositions,
    CustomStageDevicePositions,
} from '@digitalstage/api-client-react'
import { Stage as KonvaStage, Layer as KonvaLayer } from 'react-konva/lib/ReactKonvaCore'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import useImage from '../../../hooks/useImage'
import styles from './RoomManager.module.css'
import HeadlineButton from '../../ui/HeadlineButton'
import DeviceSelector from '../../DeviceSelector'
import Paragraph from '../../ui/Paragraph'
import Block from '../../ui/Block'
import useSelectedDevice from '../../../hooks/useSelectedDevice'
import useColors from '../../../hooks/useColors'
import Button from '../../ui/Button'
import StageMemberElement from './StageMemberElement'
import ElementSelection from './ElementSelection'

const FACTOR = 100.0

const DEFAULT_POSITION = {
    x: 0,
    y: 0,
    rZ: 0,
}

const StageView = ({ stage, globalMode }: { stage: Stage; globalMode: boolean }): JSX.Element => {
    const { device: deviceId } = useSelectedDevice()
    const width = stage.width * FACTOR
    const height = stage.height * FACTOR
    const [selected, setSelected] = useState<ElementSelection>(undefined)
    const wrapperRef = useRef<HTMLDivElement>()

    const connection = useConnection()
    const localStageMemberId = useStageSelector<string>(
        (state) => state.globals.localUser.stageMemberId
    )
    const stageMembers = useStageSelector<StageMember[]>((state) =>
        state.stageMembers.byStage[stage._id].map((id) => state.stageMembers.byId[id])
    )
    const users = useStageSelector<RemoteUsers>((state) => state.remoteUsers)
    const stageDevices = useStageSelector<StageDevices>((state) => state.stageDevices)
    const customStageMemberPositions = useStageSelector<CustomStageMemberPositions>(
        (state) => state.customStageMemberPositions
    )
    const customStageDevicePositions = useStageSelector<CustomStageDevicePositions>(
        (state) => state.customStageDevicePositions
    )
    const stageMemberImage = useImage('/static/icons/room-group.svg', 96, 96)
    const localStageMemberImage = useImage('/static/icons/room-group-custom.svg', 96, 96)
    const stageDeviceImage = useImage('/static/icons/room-member.svg', 64, 64)
    const localStageDeviceImage = useImage('/static/icons/room-member-custom.svg', 64, 64)
    const currentStageDeviceImage = useImage('/static/icons/room-member-custom-local.svg', 64, 64)

    const deselect = useCallback((e) => {
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty) {
            setSelected(undefined)
        }
    }, [])

    /**
     * Scroll to center when component loaded
     */
    useEffect(() => {
        if (wrapperRef.current) {
            wrapperRef.current.scrollLeft = width / 2 - window.innerWidth / 2
            wrapperRef.current.scrollTop = height / 2 - window.innerHeight / 2
        }
    }, [wrapperRef, width, height])

    const handleReset = useCallback(() => {
        if (connection) {
            if (globalMode) {
                if (selected.type === 'sm' && selected.stageMemberId) {
                    connection.emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: selected.stageMemberId,
                        ...DEFAULT_POSITION,
                    } as ClientDevicePayloads.ChangeStageMember)
                } else if (selected.type === 'sd' && selected.stageDeviceId) {
                    connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                        _id: selected.stageDeviceId,
                        ...DEFAULT_POSITION,
                    } as ClientDevicePayloads.ChangeStageDevice)
                } else {
                    throw new Error('Invalid selection')
                }
            } else if (selected.type === 'csm' && selected.customStageMemberId) {
                connection.emit(
                    ClientDeviceEvents.RemoveCustomStageMemberPosition,
                    selected.customStageMemberId as ClientDevicePayloads.RemoveCustomStageMemberPosition
                )
            } else if (selected.type === 'csd' && selected.customStageDeviceId) {
                connection.emit(
                    ClientDeviceEvents.RemoveCustomStageDevicePosition,
                    selected.customStageDeviceId as ClientDevicePayloads.RemoveCustomStageDevicePosition
                )
            }
            setSelected(undefined)
        }
    }, [connection, globalMode, selected])
    const handleResetAll = useCallback(() => {
        if (connection) {
            if (globalMode) {
                stageMembers.forEach((stageMember) =>
                    connection.emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: stageMember._id,
                        ...DEFAULT_POSITION,
                    } as ClientDevicePayloads.ChangeStageMember)
                )
                if (stageDevices.byStage[stage._id]) {
                    stageDevices.byStage[stage._id]
                        .map((id) => stageDevices.byId[id])
                        .forEach((stageDevice) =>
                            connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                                _id: stageDevice._id,
                                ...DEFAULT_POSITION,
                            } as ClientDevicePayloads.ChangeStageDevice)
                        )
                }
            } else {
                if (customStageMemberPositions.byDevice[deviceId]) {
                    customStageMemberPositions.byDevice[deviceId]
                        .map((id) => customStageMemberPositions.byId[id])
                        .forEach((customStageMember) =>
                            connection.emit(
                                ClientDeviceEvents.RemoveCustomStageMemberPosition,
                                customStageMember._id as ClientDevicePayloads.RemoveCustomStageMemberPosition
                            )
                        )
                }
                if (customStageDevicePositions.byDevice[deviceId]) {
                    customStageDevicePositions.byDevice[deviceId]
                        .map((id) => customStageDevicePositions.byId[id])
                        .forEach((customStageDevice) =>
                            connection.emit(
                                ClientDeviceEvents.RemoveCustomStageDevicePosition,
                                customStageDevice._id as ClientDevicePayloads.RemoveCustomStageDevicePosition
                            )
                        )
                }
            }
        }
    }, [
        connection,
        globalMode,
        stageDevices.byStage,
        stageDevices.byId,
        customStageMemberPositions.byDevice,
        customStageMemberPositions.byId,
        customStageDevicePositions.byDevice,
        customStageDevicePositions.byId,
    ])

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner} ref={wrapperRef}>
                <KonvaStage
                    /* @ts-ignore */
                    width={width}
                    height={height}
                    className={styles.stage}
                    onMouseDown={deselect}
                    onTouchStart={deselect}
                    x={width / 2}
                    y={height / 2}
                >
                    <KonvaLayer>
                        {stageMembers.map((stageMember) => {
                            const color = useColors(stageMember._id)
                            const customStageMember =
                                customStageMemberPositions.byDeviceAndStageMember[deviceId] &&
                                customStageMemberPositions.byDeviceAndStageMember[deviceId][
                                    stageMember._id
                                ] &&
                                customStageMemberPositions.byId[
                                    customStageMemberPositions.byDeviceAndStageMember[deviceId][
                                        stageMember._id
                                    ]
                                ]
                            const user = users.byId[stageMember.userId]
                            return (
                                <StageMemberElement
                                    key={stageMember._id}
                                    connection={connection}
                                    deviceId={deviceId}
                                    globalMode={globalMode}
                                    stageMember={stageMember}
                                    customStageMember={customStageMember}
                                    stageDevices={stageDevices}
                                    customStageDevices={customStageDevicePositions}
                                    user={user}
                                    onSelected={setSelected}
                                    selected={selected}
                                    color={color?.toProperty()}
                                    stageMemberImage={
                                        localStageMemberId === stageMember._id
                                            ? localStageMemberImage
                                            : stageMemberImage
                                    }
                                    stageDeviceImage={
                                        localStageMemberId === stageMember._id
                                            ? localStageDeviceImage
                                            : stageDeviceImage
                                    }
                                    currentStageDeviceImage={currentStageDeviceImage}
                                />
                            )
                        })}
                    </KonvaLayer>
                </KonvaStage>
            </div>
            <Button kind="primary" className={styles.buttonResetAll} onClick={handleResetAll}>
                Alle zurücksetzen
            </Button>
            {selected &&
                (globalMode ||
                    (selected.type === 'csd' && selected.customStageDeviceId) ||
                    (selected.type === 'csm' && selected.customStageMemberId)) && (
                    <Button
                        kind="primary"
                        className={styles.buttonResetSingle}
                        onClick={handleReset}
                    >
                        Ausgewähltes zurücksetzen
                    </Button>
                )}
        </div>
    )
}

const RoomManager = (): JSX.Element => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const stage = useStageSelector<Stage | undefined>(
        (state) => state.globals.stageId && state.stages.byId[state.globals.stageId]
    )
    const isSoundEditor = useStageSelector<boolean>(
        (state) =>
            state.globals.localUser &&
            state.globals.stageId &&
            state.stages.byId[state.globals.stageId].soundEditors.some(
                (admin) => admin === state.globals.localUser._id
            )
    )
    const [globalMode, setGlobalMode] = useState<boolean>(false)
    const { device } = useSelectedDevice()

    if (ready && stage) {
        return (
            <Block vertical height="full">
                {isSoundEditor && (
                    <Block vertical flexGrow={0}>
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
                        <Block padding={2}>
                            <Paragraph kind="micro">
                                {globalMode
                                    ? 'Diese Einstellungen gelten als Voreinstellung für alle'
                                    : 'Diese Einstellungen gelten nur für Dich'}
                            </Paragraph>
                        </Block>
                        {!globalMode && (
                            <Block padding={2}>
                                <DeviceSelector />
                            </Block>
                        )}
                    </Block>
                )}
                <Block flexGrow={1}>
                    {globalMode || device ? (
                        <StageView stage={stage} globalMode={globalMode} />
                    ) : (
                        <h2>Bitte wähle erste einer Gerät</h2>
                    )}
                </Block>
            </Block>
        )
    }

    return null
}
export default RoomManager

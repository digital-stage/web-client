/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
    useConnection,
    Stage,
    StageDevice,
    useStageSelector,
    StageMember,
    User,
    StageDevices,
    RemoteUsers,
    CustomStageMemberPositions,
    CustomStageDevicePositions,
    CustomStageDevicePosition,
} from '@digitalstage/api-client-react'
import { Stage as KonvaStage, Layer as KonvaLayer } from 'react-konva/lib/ReactKonvaCore'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomStageMemberPosition,
} from '@digitalstage/api-types'
import { ITeckosClient } from 'teckos-client'
import useImage from '../../../hooks/useImage'
import styles from './RoomManager.module.css'
import HeadlineButton from '../../ui/HeadlineButton'
import DeviceSelector from '../../DeviceSelector'
import Paragraph from '../../ui/Paragraph'
import Block from '../../ui/Block'
import useSelectedDevice from '../../../hooks/useSelectedDevice'
import StageElement from './StageElement'
import useColors from '../../../hooks/useColors'
import Button from '../../ui/Button'

const FACTOR = 100.0

const StageDeviceNode = ({
    globalMode,
    deviceId,
    offsetX,
    offsetY,
    offsetRz,
    stageDevice,
    customStageDevice,
    onChange,
    onSelected,
    selected,
    user,
    color,
    stageDeviceImage,
    customStageDeviceImage,
    localStageDeviceImage,
    localCustomStageDeviceImage,
}: {
    globalMode: boolean
    deviceId: string
    offsetX: number
    offsetY: number
    offsetRz: number
    stageDevice: StageDevice
    customStageDevice?: CustomStageDevicePosition
    onChange: (position: { x: number; y: number; rZ: number }) => void
    onSelected: (_id: string) => void
    selected: boolean
    user?: User
    color: string
    stageDeviceImage: CanvasImageSource
    customStageDeviceImage: CanvasImageSource
    localStageDeviceImage: CanvasImageSource
    localCustomStageDeviceImage: CanvasImageSource
}) => {
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: offsetX + stageDevice.x,
        y: offsetY + stageDevice.y,
        rZ: offsetRz + stageDevice.rZ,
    })
    let image = stageDeviceImage
    if (stageDevice.deviceId === deviceId) {
        if (globalMode || !customStageDevice) {
            image = localStageDeviceImage
        } else {
            image = localCustomStageDeviceImage
        }
    } else if (!globalMode && customStageDevice) {
        image = customStageDeviceImage
    }
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
    }, [globalMode, stageDevice, customStageDevice, offsetX, offsetY, offsetRz])
    return (
        <StageElement
            x={position.x}
            y={position.y}
            rZ={position.rZ}
            size={96}
            image={image}
            onChanged={(currPos) => {
                setPosition(currPos)
            }}
            onChangeFinished={({ x, y, rZ }) => {
                setPosition({ x, y, rZ })
                onChange({
                    x: x - offsetX,
                    y: y - offsetY,
                    rZ: rZ - offsetRz,
                })
            }}
            selected={selected}
            onClick={() => {
                if (globalMode) {
                    onSelected(stageDevice._id)
                } else if (customStageDevice) {
                    onSelected(customStageDevice._id)
                }
            }}
            label={`${user?.name}: ${stageDevice?.name || stageDevice._id}`}
            color={color}
        />
    )
}
StageDeviceNode.defaultProps = {
    customStageDevice: undefined,
    user: undefined,
}

const StageMemberNode = ({
    deviceId,
    globalMode,
    localStageMemberId,
    stageMember,
    user,
    stageDevices,
    customStageMember,
    customStageDevices,
    connection,
    selected,
    onSelected,
    color,
    stageMemberImage,
    customStageMemberImage,
    stageDeviceImage,
    customStageDeviceImage,
    localStageMemberImage,
    localCustomStageMemberImage,
    localStageDeviceImage,
    localCustomStageDeviceImage,
}: {
    connection: ITeckosClient
    deviceId: string
    globalMode: boolean
    localStageMemberId: string
    stageMember: StageMember
    stageDevices: StageDevices
    customStageMember?: CustomStageMemberPosition
    customStageDevices: CustomStageDevicePositions
    user?: User
    onSelected: (_id: string, type: 'stageMember' | 'stageDevice') => void
    selected: string
    color: string
    stageMemberImage: CanvasImageSource
    customStageMemberImage: CanvasImageSource
    localStageMemberImage: CanvasImageSource
    localCustomStageMemberImage: CanvasImageSource
    stageDeviceImage: CanvasImageSource
    customStageDeviceImage: CanvasImageSource
    localStageDeviceImage: CanvasImageSource
    localCustomStageDeviceImage: CanvasImageSource
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
    let image = stageMemberImage
    if (stageMember._id === localStageMemberId) {
        if (globalMode || !customStageMember) {
            image = localStageMemberImage
        } else {
            image = localCustomStageMemberImage
        }
    } else if (!globalMode && customStageMember) {
        image = customStageMemberImage
    }
    return (
        <>
            <StageElement
                x={position.x}
                y={position.y}
                rZ={position.rZ}
                size={128}
                image={image}
                onChanged={(currPosition) => {
                    setPosition(currPosition)
                }}
                onChangeFinished={({ x, y, rZ }) => {
                    if (globalMode) {
                        connection.emit(ClientDeviceEvents.ChangeStageMember, {
                            _id: stageMember._id,
                            x,
                            y,
                            rZ,
                        } as ClientDevicePayloads.ChangeStageMember)
                    } else {
                        connection.emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
                            stageMemberId: stageMember._id,
                            deviceId,
                            x,
                            y,
                            rZ,
                        } as ClientDevicePayloads.SetCustomStageMemberPosition)
                    }
                }}
                selected={stageMember._id === selected}
                onClick={() => {
                    if (globalMode) {
                        onSelected(stageMember._id, 'stageMember')
                    } else if (customStageMember) {
                        onSelected(customStageMember._id, 'stageMember')
                    }
                }}
                label={user?.name || stageMember._id}
                color={color || '#fff'}
            />
            {stageDevices.byStageMember[stageMember._id] &&
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
                            <StageDeviceNode
                                key={stageDevice._id}
                                globalMode={globalMode}
                                offsetX={position.x}
                                offsetY={position.y}
                                offsetRz={position.rZ}
                                stageDevice={stageDevice}
                                customStageDevice={customStageDevice}
                                deviceId={deviceId}
                                onChange={({ x, y, rZ }) => {
                                    if (globalMode) {
                                        connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                                            _id: stageDevice._id,
                                            x,
                                            y,
                                            rZ,
                                        } as ClientDevicePayloads.ChangeStageDevice)
                                    } else {
                                        connection.emit(
                                            ClientDeviceEvents.SetCustomStageDevicePosition,
                                            {
                                                stageDeviceId: stageDevice._id,
                                                deviceId,
                                                x,
                                                y,
                                                rZ,
                                            } as ClientDevicePayloads.SetCustomStageDevicePosition
                                        )
                                    }
                                }}
                                onSelected={() => onSelected(stageDevice._id, 'stageDevice')}
                                selected={stageDevice._id === selected}
                                user={user}
                                color={color || '#fff'}
                                stageDeviceImage={stageDeviceImage}
                                customStageDeviceImage={customStageDeviceImage}
                                localStageDeviceImage={localStageDeviceImage}
                                localCustomStageDeviceImage={localCustomStageDeviceImage}
                            />
                        )
                    })}
        </>
    )
}
StageMemberNode.defaultProps = {
    user: undefined,
    customStageMember: undefined,
}

const StageView = ({ stage, globalMode }: { stage: Stage; globalMode: boolean }): JSX.Element => {
    const { device: deviceId } = useSelectedDevice()
    const width = stage.width * FACTOR
    const height = stage.height * FACTOR
    const [selected, setSelected] =
        useState<{
            _id: string
            type: 'stageMember' | 'stageDevice'
        }>(undefined)
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
    const getColor = useColors()
    const localStageMemberImage = useImage('/static/icons/room-group-local.svg', 128, 128)
    const localCustomStageMemberImage = useImage(
        '/static/icons/room-group-custom-local.svg',
        128,
        128
    )
    const localStageDeviceImage = useImage('/static/icons/room-member-local.svg', 94, 94)
    const localCustomStageDeviceImage = useImage(
        '/static/icons/room-member-custom-local.svg',
        94,
        94
    )
    const stageMemberImage = useImage('/static/icons/room-group.svg', 128, 128)
    const customStageMemberImage = useImage('/static/icons/room-group-custom.svg', 128, 128)
    const stageDeviceImage = useImage('/static/icons/room-member.svg', 94, 94)
    const customStageDeviceImage = useImage('/static/icons/room-member-custom.svg', 94, 94)

    const deselect = useCallback((e) => {
        const clickedOnEmpty = e.target === e.target.getStage()
        if (clickedOnEmpty) {
            setSelected(undefined)
        }
    }, [])

    return (
        <div className={styles.wrapper} ref={wrapperRef}>
            <div className={styles.inner}>
                {/* @ts-ignore */}
                <KonvaStage
                    width={width}
                    height={height}
                    className={styles.stage}
                    onMouseDown={deselect}
                    onTouchStart={deselect}
                >
                    <KonvaLayer>
                        {stageMembers.map((stageMember) => {
                            const color = getColor(stageMember._id)?.toProperty()
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
                                <StageMemberNode
                                    key={stageMember._id}
                                    connection={connection}
                                    deviceId={deviceId}
                                    globalMode={globalMode}
                                    stageMember={stageMember}
                                    customStageMember={customStageMember}
                                    stageDevices={stageDevices}
                                    customStageDevices={customStageDevicePositions}
                                    user={user}
                                    onSelected={(_id, type) => setSelected({ _id, type })}
                                    selected={selected?._id}
                                    color={color}
                                    stageMemberImage={stageMemberImage}
                                    customStageMemberImage={customStageMemberImage}
                                    stageDeviceImage={stageDeviceImage}
                                    customStageDeviceImage={customStageDeviceImage}
                                    localStageDeviceImage={localStageDeviceImage}
                                    localCustomStageDeviceImage={localCustomStageDeviceImage}
                                    localStageMemberImage={localStageMemberImage}
                                    localCustomStageMemberImage={localCustomStageMemberImage}
                                    localStageMemberId={localStageMemberId}
                                />
                            )
                        })}
                    </KonvaLayer>
                </KonvaStage>
            </div>
            <Button kind="primary" className={styles.buttonResetAll}>
                Alle zurücksetzen
            </Button>
            {selected && (
                <Button
                    kind="primary"
                    className={styles.buttonResetSingle}
                    onClick={() => {
                        if (selected.type === 'stageDevice') {
                            if (globalMode) {
                                connection.emit(
                                    ClientDeviceEvents.RemoveStageDevice,
                                    selected._id as ClientDevicePayloads.RemoveStageDevice
                                )
                            } else {
                                connection.emit(
                                    ClientDeviceEvents.RemoveCustomStageDevicePosition,
                                    selected._id as ClientDevicePayloads.RemoveCustomStageDevicePosition
                                )
                            }
                        } else if (globalMode) {
                            connection.emit(
                                ClientDeviceEvents.RemoveStageMember,
                                selected._id as ClientDevicePayloads.RemoveStageMember
                            )
                        } else {
                            connection.emit(
                                ClientDeviceEvents.RemoveCustomStageMemberPosition,
                                selected._id as ClientDevicePayloads.RemoveCustomStageMemberPosition
                            )
                        }
                    }}
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

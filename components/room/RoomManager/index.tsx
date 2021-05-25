/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useEffect, useRef, useState } from 'react'
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
import { Stage as KonvaStage, Layer as KonvaLayer, Image as KonvaImage, Text } from 'react-konva'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomStageMemberPosition,
} from '@digitalstage/api-types'
import { RoomElement } from '../RoomEditor'
import useImage from '../../../hooks/useImage'
import styles from './RoomManager.module.css'
import HeadlineButton from '../../ui/HeadlineButton'
import DeviceSelector from '../../DeviceSelector'
import Paragraph from '../../ui/Paragraph'
import Block from '../../ui/Block'
import useSelectedDevice from '../../../hooks/useSelectedDevice'
import StageElement from './StageElement'

const FACTOR = 100.0

const StageDeviceNode = ({
    globalMode,
    offsetX,
    offsetY,
    offsetRz,
    stageDevice,
    customStageDevice,
    onChange,
}: {
    globalMode: boolean
    offsetX: number
    offsetY: number
    offsetRz: number
    stageDevice: StageDevice
    customStageDevice?: CustomStageDevicePosition
    onChange: (x: number, y: number, rZ: number) => void
}) => {
    const stageDeviceImage = useImage('/static/icons/room-member.svg', 96, 96)
    const customStageDeviceImage = useImage('/static/icons/room-member-custom.svg', 96, 96)
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: stageDevice.x,
        y: stageDevice.y,
        rZ: stageDevice.rZ,
    })
    useEffect(() => {
        if (!globalMode && customStageDevice) {
            setPosition({
                x: customStageDevice.x,
                y: customStageDevice.y,
                rZ: customStageDevice.rZ,
            })
        } else {
            setPosition({ x: stageDevice.x, y: stageDevice.y, rZ: stageDevice.rZ })
        }
    }, [globalMode, stageDevice, customStageDevice])
    return (
        <>
            <KonvaImage
                x={offsetX + position.x}
                y={offsetY + position.y}
                rotation={offsetRz + position.rZ}
                width={96}
                height={96}
                offsetX={96}
                offsetY={96}
                image={!globalMode && customStageDevice ? customStageDeviceImage : stageDeviceImage}
                onDragMove={(e) => {
                    setPosition({
                        x: e.target.attrs.x,
                        y: e.target.attrs.y,
                        rZ: e.target.attrs.rotation,
                    })
                }}
                onDragEnd={(e) => {
                    console.log(e.target.attrs)
                    onChange(e.target.attrs.x, e.target.attrs.y, e.target.attrs.rotation)
                }}
                draggable
            />
            <Text
                fill="#fff"
                x={offsetX + position.x - 32}
                y={offsetY + position.y + 64}
                text={stageDevice?.name || stageDevice._id}
            />
        </>
    )
}
StageDeviceNode.defaultProps = {
    customStageDevice: undefined,
}

const StageMemberNode2 = ({
    deviceId,
    globalMode,
    stageMember,
    user,
    stageDevices,
    customStageMember,
    customStageDevices,
    onChanged,
    onStageDeviceChanged,
}: {
    deviceId: string
    globalMode: boolean
    stageMember: StageMember
    stageDevices: StageDevice[]
    customStageMember: CustomStageMemberPosition
    customStageDevices: CustomStageDevicePositions
    user?: User
    onChanged: (x: number, y: number, rZ: number) => void
    onStageDeviceChanged: (stageDeviceId: string, x: number, y: number, rZ: number) => void
}) => {
    // We cannot use useContext here, so we outsourced all useStageSelector calls into the parent object
    const stageMemberImage = useImage('/static/icons/room-group.svg', 128, 128)
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: stageMember.x,
        y: stageMember.y,
        rZ: stageMember.rZ,
    })

    useEffect(() => {
        if (globalMode || !customStageMember) {
            setPosition({ x: stageMember.x, y: stageMember.y, rZ: stageMember.rZ })
        } else {
            setPosition({
                x: customStageMember.x,
                y: customStageMember.y,
                rZ: customStageMember.rZ,
            })
        }
    }, [stageMember.x, stageMember.y, globalMode, deviceId, customStageMember])

    return (
        <>
            <KonvaImage
                x={position.x}
                y={position.y}
                width={128}
                height={128}
                offsetX={64}
                offsetY={64}
                image={stageMemberImage}
                draggable
                onDragMove={(e) => {
                    setPosition({
                        x: e.target.attrs.x,
                        y: e.target.attrs.y,
                        rZ: e.target.attrs.rotation,
                    })
                }}
                onDragEnd={() => {
                    onChanged(position.x, position.y, position.rZ)
                }}
            />
            {stageDevices.map((stageDevice) => (
                <StageDeviceNode
                    globalMode={globalMode}
                    offsetX={position.x}
                    offsetY={position.y}
                    offsetRz={position.rZ}
                    stageDevice={stageDevice}
                    customStageDevice={
                        customStageDevices.byDeviceAndStageDevice[deviceId] &&
                        customStageDevices.byDeviceAndStageDevice[deviceId][stageDevice._id] &&
                        customStageDevices.byId[
                            customStageDevices.byDeviceAndStageDevice[deviceId][stageDevice._id]
                        ]
                    }
                    onChange={(x, y, rZ) => onStageDeviceChanged(stageDevice._id, x, y, rZ)}
                />
            ))}
            <Text
                fill="#fff"
                x={position.x - 32}
                y={position.y + 64}
                text={user?.name || stageMember._id}
            />
        </>
    )
}

const StageView = ({ stage, globalMode }: { stage: Stage; globalMode: boolean }): JSX.Element => {
    const { device: deviceId } = useSelectedDevice()
    const width = stage.width * FACTOR
    const height = stage.height * FACTOR
    const centerX = width / 2
    const centerY = width / 2
    const [selected, setSelected] = useState<RoomElement>(undefined)
    const wrapperRef = useRef<HTMLDivElement>()
    const stageMembers = useStageSelector((state) =>
        stage ? state.stageMembers.byStage[stage._id].map((id) => state.stageMembers.byId[id]) : []
    )
    const connection = useConnection()
    const users = useStageSelector<RemoteUsers>((state) => state.remoteUsers)
    const stageDevices = useStageSelector<StageDevices>((state) => state.stageDevices)
    const customStageMemberPositions = useStageSelector<CustomStageMemberPositions>(
        (state) => state.customStageMemberPositions
    )
    const customStageDevicePositions = useStageSelector<CustomStageDevicePositions>(
        (state) => state.customStageDevicePositions
    )

    const centerImage = useImage('/static/icons/room-center.svg', 96, 96)
    const stageMemberImage = useImage('/static/icons/room-group.svg', 128, 128)
    const customStageMemberImage = useImage('/static/icons/room-group-custom.svg', 128, 128)
    return (
        <div className={styles.stageWrapper} ref={wrapperRef}>
            <KonvaStage width={width} height={height} className={styles.stage}>
                <KonvaLayer>
                    <KonvaImage
                        x={centerX}
                        y={centerY}
                        width={128}
                        height={128}
                        offsetX={64}
                        offsetY={64}
                        image={centerImage}
                    />
                    {stageMembers.map((stageMember) => {
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
                            <StageElement
                                x={
                                    !globalMode && customStageMember
                                        ? customStageMember.x
                                        : stageMember.x
                                }
                                y={
                                    !globalMode && customStageMember
                                        ? customStageMember.y
                                        : stageMember.y
                                }
                                rZ={
                                    !globalMode && customStageMember
                                        ? customStageMember.rZ
                                        : stageMember.rZ
                                }
                                size={128}
                                offsetX={0}
                                offsetY={0}
                                offsetRz={0}
                                image={
                                    !globalMode && customStageMember
                                        ? customStageMemberImage
                                        : stageMemberImage
                                }
                                onChanged={(x, y, rZ) => {
                                    if (globalMode) {
                                        connection.emit(ClientDeviceEvents.ChangeStageMember, {
                                            _id: stageMember._id,
                                            x,
                                            y,
                                            rZ,
                                        } as ClientDevicePayloads.ChangeStageMember)
                                    } else {
                                        connection.emit(
                                            ClientDeviceEvents.SetCustomStageMemberPosition,
                                            {
                                                stageMemberId: stageMember._id,
                                                deviceId,
                                                x,
                                                y,
                                                rZ,
                                            } as ClientDevicePayloads.SetCustomStageMemberPosition
                                        )
                                    }
                                }}
                                label={user?.name || stageMember._id}
                            />
                        )
                    })}
                </KonvaLayer>
            </KonvaStage>
        </div>
    )
}

const RoomManager = (): JSX.Element => {
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

    if (stage) {
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

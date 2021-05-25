/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { useState } from 'react'
import {
    useConnection,
    RemoteUsers,
    CustomStageDevicePositions,
    CustomStageMemberPositions,
    Stage,
    StageDevice,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import RoomEditor, { RoomElement } from '../RoomEditor'
import useImage from '../../../hooks/useImage'
import styles from './RoomManager.module.css'

import useSelectedDevice from '../../../hooks/useSelectedDevice'
import HeadlineButton from '../../ui/HeadlineButton'
import DeviceSelector from '../../DeviceSelector'
import Button from '../../ui/Button'
import Paragraph from '../../ui/Paragraph'
import Block from '../../ui/Block'

const RoomManager = (): JSX.Element => {
    const connection = useConnection()
    const { device } = useSelectedDevice()
    const users = useStageSelector<RemoteUsers>((state) => state.remoteUsers)
    const stage = useStageSelector<Stage>(
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

    const customStageMemberPositions = useStageSelector<CustomStageMemberPositions>(
        (state) => state.customStageMemberPositions
    )
    const stageDevices = useStageSelector<StageDevice[]>((state) =>
        stage ? state.stageDevices.byStage[stage._id].map((id) => state.stageDevices.byId[id]) : []
    )
    const customStageDevicePositions = useStageSelector<CustomStageDevicePositions>(
        (state) => state.customStageDevicePositions
    )

    const image = useImage('/static/icons/room-member.svg', 96, 96)
    const customImage = useImage('/static/icons/room-member-custom.svg', 96, 96)
    const [selected, setSelected] = useState<RoomElement>(undefined)
    const [globalMode, setGlobalMode] = useState<boolean>(false)

    if (stage) {
        return (
            <div className={styles.wrapper}>
                {isSoundEditor && (
                    <Block vertical>
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
                    </Block>
                )}
                {!globalMode && (
                    <div className={styles.deviceSelect}>
                        <label className="micro">
                            Betreffendes Gerät:&nbsp;&nbsp;
                            <DeviceSelector />
                        </label>
                    </div>
                )}

                <div className={styles.editorWrapper}>
                    <RoomEditor
                        className={styles.editor}
                        elements={stageDevices.map((stageDevice) => {
                            if (
                                !globalMode &&
                                customStageMemberPositions.byDeviceAndStageMember[device] &&
                                customStageDevicePositions.byDeviceAndStageDevice[device][
                                    stageDevice._id
                                ]
                            ) {
                                const customStageMember =
                                    customStageMemberPositions.byId[
                                        customStageMemberPositions.byDeviceAndStageMember[device][
                                            stageDevice._id
                                        ]
                                    ]
                                return {
                                    ...stageDevice,
                                    image: customImage,
                                    name: users[stageDevice.userId]?.name || stageDevice._id,
                                    x: customStageMember.x,
                                    y: customStageMember.y,
                                    z: customStageMember.z,
                                    rX: customStageMember.rX,
                                    rY: customStageMember.rY,
                                    rZ: customStageMember.rZ,
                                    isGlobal: false,
                                    opacity: 0.8,
                                }
                            }
                            return {
                                ...stageDevice,
                                image,
                                name: users[stageDevice.userId]?.name || stageDevice._id,
                                isGlobal: true,
                                opacity: globalMode ? 0.8 : 0.4,
                            }
                        })}
                        width={stage.width}
                        height={stage.height}
                        onChange={(element) => {
                            if (globalMode && isSoundEditor) {
                                connection.emit(ClientDeviceEvents.ChangeStageMember, {
                                    _id: element._id,
                                    x: element.x,
                                    y: element.y,
                                    rZ: element.rZ,
                                } as ClientDevicePayloads.ChangeStageMember)
                            } else {
                                connection.emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
                                    stageMemberId: element._id,
                                    deviceId: device,
                                    x: element.x,
                                    y: element.y,
                                    rZ: element.rZ,
                                } as ClientDevicePayloads.SetCustomStageMemberPosition)
                            }
                        }}
                        onSelected={(element) => setSelected(element)}
                        onDeselected={() => setSelected(undefined)}
                    />

                    <Button
                        kind="primary"
                        className={styles.buttonResetAll}
                        onClick={() => {
                            if (globalMode && isSoundEditor) {
                                // Also reset stage members
                                stageDevices.forEach((stageDevice) => {
                                    connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                                        _id: stageDevice._id,
                                        x: 0,
                                        y: -1,
                                        rZ: 180,
                                    } as ClientDevicePayloads.ChangeStageDevice)
                                })
                            } else {
                                customStageDevicePositions.allIds.forEach((id) => {
                                    connection.emit(
                                        ClientDeviceEvents.RemoveCustomStageDevicePosition,
                                        id as ClientDevicePayloads.RemoveCustomStageDevicePosition
                                    )
                                })
                            }
                        }}
                    >
                        Alle zurücksetzen
                    </Button>
                    {selected && (
                        <Button
                            kind="primary"
                            className={styles.buttonResetSingle}
                            onClick={() => {
                                if (selected) {
                                    if (globalMode && isSoundEditor) {
                                        connection.emit(ClientDeviceEvents.ChangeStageDevice, {
                                            _id: selected._id,
                                            x: 0,
                                            y: -1,
                                            rZ: 180,
                                        } as ClientDevicePayloads.ChangeStageDevice)
                                    } else if (
                                        customStageMemberPositions.byDeviceAndStageMember[device][
                                            selected._id
                                        ]
                                    ) {
                                        const customStageDevicePosition =
                                            customStageDevicePositions.byId[
                                                customStageDevicePositions.byDeviceAndStageDevice[
                                                    device
                                                ][selected._id]
                                            ]
                                        connection.emit(
                                            ClientDeviceEvents.RemoveCustomStageMemberPosition,
                                            customStageDevicePosition._id as ClientDevicePayloads.RemoveCustomStageMemberPosition
                                        )
                                    }
                                }
                            }}
                        >
                            Markierte zurücksetzen
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return null
}
export default RoomManager

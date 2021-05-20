import React, { useState } from 'react'
import Image from 'next/image'
import { FaTrash, FaPlus, FaArrowRight, FaEdit } from 'react-icons/fa'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group, Stage } from '@digitalstage/api-types'
import { MdEdit } from 'react-icons/md'
import Block from '../components/ui/Block'
import Collapse from '../components/ui/Collapse'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import List, { ListItem } from '../components/ui/List'
import styles from '../styles/Stages.module.css'
import Button, { SecondaryButton, DangerButton } from '../components/ui/Button'
import StageModal from '../components/modals/StageModal'

const GroupRow = ({
    id,
    stageId,
    isAdmin,
    onGroupModalRequested,
}: {
    id: string
    stageId: string
    isAdmin?: boolean
    onGroupModalRequested: () => void
}) => {
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const currentGroupId = useStageSelector<string | undefined>((state) => state.globals.groupId)
    const connection = useConnection()
    return (
        <ListItem
            icon={<div className={styles.circle} style={{ backgroundColor: group.color }} />}
            title={group.name}
            actions={
                <>
                    {isAdmin && (
                        <>
                            <SecondaryButton round size="small" onClick={onGroupModalRequested}>
                                <MdEdit />
                            </SecondaryButton>
                            <DangerButton round size="small">
                                <FaTrash />
                            </DangerButton>
                            <SecondaryButton>
                                <strong>Einladen</strong>
                            </SecondaryButton>
                        </>
                    )}
                    {currentGroupId === id ? (
                        <DangerButton
                            onClick={() => connection.emit(ClientDeviceEvents.LeaveStage)}
                        >
                            <strong>Verlassen</strong>
                        </DangerButton>
                    ) : (
                        <Button
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.JoinStage, {
                                    stageId,
                                    groupId: id,
                                    password: null,
                                } as ClientDevicePayloads.JoinStage)
                            }
                        >
                            <strong>Beitreten</strong>
                        </Button>
                    )}
                </>
            }
        />
    )
}
GroupRow.defaultProps = {
    isAdmin: undefined,
}

const StageRow = ({
    id,
    onStageModalRequested,
    onGroupModalRequested,
}: {
    id: string
    onStageModalRequested: () => void
    onGroupModalRequested: (groupId: string) => void
}) => {
    const stage = useStageSelector<Stage>((state) => state.stages.byId[id])
    const localUserId = useStageSelector<string | undefined>(
        (state) => state.globals.localUser?._id
    )
    const isStageAdmin = localUserId && stage.admins.some((admin) => admin === localUserId)
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[id])
    return (
        <Collapse
            icon={<Image width="30" height="30" src="/static/stage.svg" />}
            title={<h3>{stage.name}</h3>}
            actions={
                <Block>
                    <DangerButton
                        title="Bühne bearbeiten"
                        round
                        size="small"
                        onClick={onStageModalRequested}
                    >
                        <FaEdit size={18} />
                    </DangerButton>
                </Block>
            }
        >
            <List>
                {groupIds &&
                    groupIds.map((groupId) => (
                        <GroupRow
                            key={groupId}
                            id={groupId}
                            stageId={id}
                            isAdmin={isStageAdmin}
                            onGroupModalRequested={() => onGroupModalRequested(groupId)}
                        />
                    ))}
            </List>
        </Collapse>
    )
}

const Stages = () => {
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    const [stageModalOpen, setStageModalOpen] = useState<boolean>(false)
    const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false)
    const [selectedStageId, setSelectedStageId] = useState<string>()
    const [selectedGroupId, setSelectedGroupId] = useState<string>()
    return (
        <Container>
            <Block paddingTop={4} paddingBottom={4}>
                <h1>Meine Bühnen</h1>
                <Panel padding={0}>
                    <Block vertical paddingLeft={4} paddingRight={4}>
                        <Block style={{ borderBottom: '1px solid #676767' }}>
                            <Block
                                align="center"
                                justify="center"
                                padding={1}
                                width={6}
                                style={{ borderRight: '1px solid #676767' }}
                            >
                                <Button
                                    kind="minimal"
                                    icon={<FaPlus />}
                                    onClick={() => {
                                        setSelectedStageId(undefined)
                                        setSelectedGroupId(undefined)
                                        setStageModalOpen(true)
                                    }}
                                >
                                    &nbsp;Neue Bühne erstellen
                                </Button>
                            </Block>
                            <Block align="center" justify="center" padding={1} width={6}>
                                <Button kind="minimal" icon={<FaArrowRight />}>
                                    &nbsp;Neue Teilnahme
                                </Button>
                            </Block>
                        </Block>
                    </Block>
                    <Block vertical paddingBottom={4}>
                        {stageIds &&
                            stageIds.map((id) => (
                                <StageRow
                                    key={id}
                                    id={id}
                                    onStageModalRequested={() => {
                                        setSelectedStageId(id)
                                        setStageModalOpen(true)
                                    }}
                                    onGroupModalRequested={(groupId) => {
                                        setSelectedStageId(id)
                                        setSelectedGroupId(groupId)
                                        setGroupModalOpen(true)
                                    }}
                                />
                            ))}
                    </Block>
                </Panel>
            </Block>
            <StageModal
                stageId={selectedStageId}
                open={stageModalOpen}
                onClose={() => setStageModalOpen(false)}
            />
        </Container>
    )
}
export default Stages

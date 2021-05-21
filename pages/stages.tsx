import React, { useState } from 'react'
import Image from 'next/image'
import { FaTrash, FaPlus, FaArrowRight, FaEdit, FaShareSquare } from 'react-icons/fa'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, Group, Stage } from '@digitalstage/api-types'
import Block from '../components/ui/Block'
import Collapse from '../components/ui/Collapse'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import List, { ListItem } from '../components/ui/List'
import styles from '../styles/Stages.module.css'
import Button, { SecondaryButton, DangerButton } from '../components/ui/Button'
import RemoveGroupModal from '../components/modals/RemoveGroupModal'
import RemoveStageModal from '../components/modals/RemoveStageModal'
import GroupModal from '../components/modals/GroupModal'
import StageModal from '../components/modals/StageModal'
import InviteModal from '../components/modals/InviteModal'
import useStageJoiner from '../hooks/useStageJoiner'

const GroupRow = ({
    id,
    stage,
    isAdmin,
    onGroupModalRequested,
    onRemoveGroupModalRequested,
    onInviteModalRequested,
}: {
    id: string
    stage: Stage
    isAdmin?: boolean
    onGroupModalRequested: () => void
    onRemoveGroupModalRequested: () => void
    onInviteModalRequested: () => void
}) => {
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const currentGroupId = useStageSelector<string | undefined>((state) => state.globals.groupId)
    const connection = useConnection()
    const { requestJoin } = useStageJoiner()
    return (
        <ListItem
            icon={<div className={styles.circle} style={{ backgroundColor: group.color }} />}
            title={group.name}
            actions={
                <>
                    <Button round size="small" kind="minimal" onClick={onInviteModalRequested}>
                        <FaShareSquare />
                    </Button>
                    {currentGroupId === id ? (
                        <DangerButton
                            onClick={() => connection.emit(ClientDeviceEvents.LeaveStage)}
                        >
                            <strong>Verlassen</strong>
                        </DangerButton>
                    ) : (
                        <Button onClick={() => requestJoin(stage._id, id, stage.password)}>
                            <strong>Beitreten</strong>
                        </Button>
                    )}
                </>
            }
        >
            {isAdmin && (
                <Block>
                    <Button kind="minimal" onClick={onGroupModalRequested} icon={<FaEdit />}>
                        Bearbeiten
                    </Button>
                    <Button kind="minimal" onClick={onInviteModalRequested} icon={<FaEdit />}>
                        Einladen
                    </Button>
                    <Button kind="minimal" onClick={onRemoveGroupModalRequested} icon={<FaTrash />}>
                        Entfernen
                    </Button>
                </Block>
            )}
        </ListItem>
    )
}
GroupRow.defaultProps = {
    isAdmin: undefined,
}

const StageRow = ({
    id,
    onGroupSelected,
    onStageModalRequested,
    onGroupModalRequested,
    onRemoveStageModalRequested,
    onRemoveGroupModalRequested,
    onInviteModalRequested,
}: {
    id: string
    onGroupSelected: (groupId: string) => void
    onStageModalRequested: () => void
    onRemoveStageModalRequested: () => void
    onGroupModalRequested: () => void
    onRemoveGroupModalRequested: () => void
    onInviteModalRequested: () => void
}) => {
    const stage = useStageSelector<Stage>((state) => state.stages.byId[id])
    const localUserId = useStageSelector<string | undefined>(
        (state) => state.globals.localUser?._id
    )
    const isStageAdmin = localUserId && stage.admins.some((admin) => admin === localUserId)
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[id])
    return (
        <Collapse
            initialCollapsed
            icon={<Image width="30" height="30" src="/static/stage.svg" />}
            title={<h3>{stage.name}</h3>}
            actions={
                isStageAdmin && (
                    <Block>
                        <Block paddingRight={1}>
                            <Button
                                kind="secondary"
                                title="Bühne bearbeiten"
                                round
                                size="small"
                                onClick={onStageModalRequested}
                            >
                                <FaEdit size={18} />
                            </Button>
                        </Block>
                        <Button
                            kind="danger"
                            title="Bühne entfernen"
                            round
                            size="small"
                            onClick={onRemoveStageModalRequested}
                        >
                            <FaTrash size={18} />
                        </Button>
                    </Block>
                )
            }
        >
            <List>
                {groupIds &&
                    groupIds.map((groupId) => (
                        <GroupRow
                            key={groupId}
                            id={groupId}
                            stage={stage}
                            isAdmin={isStageAdmin}
                            onGroupModalRequested={() => {
                                onGroupSelected(groupId)
                                onGroupModalRequested()
                            }}
                            onRemoveGroupModalRequested={() => {
                                onGroupSelected(groupId)
                                onRemoveGroupModalRequested()
                            }}
                            onInviteModalRequested={() => {
                                onGroupSelected(groupId)
                                onInviteModalRequested()
                            }}
                        />
                    ))}
                {isStageAdmin && (
                    <>
                        <hr />
                        <Block width="full">
                            <Button
                                kind="minimal"
                                icon={<FaPlus />}
                                onClick={() => {
                                    onGroupSelected(undefined)
                                    onGroupModalRequested()
                                }}
                            >
                                Neue Gruppe erstellen
                            </Button>
                        </Block>
                    </>
                )}
            </List>
        </Collapse>
    )
}

const Stages = () => {
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false)
    const [stageModalOpen, setStageModalOpen] = useState<boolean>(false)
    const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false)
    const [removeStageModalOpen, setRemoveStageModalOpen] = useState<boolean>(false)
    const [removeGroupModalOpen, setRemoveGroupModalOpen] = useState<boolean>(false)

    const [selectedStageId, setSelectedStageId] = useState<string>()
    const [selectedGroupId, setSelectedGroupId] = useState<string>()
    return (
        <Container>
            <Block paddingTop={4} paddingBottom={5}>
                <h1>Meine Bühnen</h1>
                <Panel padding={0}>
                    <Block vertical paddingLeft={4} paddingRight={4}>
                        <Block style={{ borderBottom: '1px solid #676767' }}>
                            <Block align="center" justify="center" padding={1} width={[12, 6]}>
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
                            <Block align="center" justify="center" padding={1} width={[12, 6]}>
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
                                    onGroupSelected={(groupId) => {
                                        setSelectedGroupId(groupId)
                                    }}
                                    onStageModalRequested={() => {
                                        setSelectedStageId(id)
                                        setStageModalOpen(true)
                                    }}
                                    onGroupModalRequested={() => {
                                        setSelectedStageId(id)
                                        setGroupModalOpen(true)
                                    }}
                                    onRemoveStageModalRequested={() => {
                                        setSelectedStageId(id)
                                        setRemoveStageModalOpen(true)
                                    }}
                                    onRemoveGroupModalRequested={() => {
                                        setRemoveGroupModalOpen(true)
                                    }}
                                    onInviteModalRequested={() => {
                                        setSelectedStageId(id)
                                        setInviteModalOpen(true)
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
            <GroupModal
                stageId={selectedStageId}
                groupId={selectedGroupId}
                open={groupModalOpen}
                onClose={() => setGroupModalOpen(false)}
            />
            <RemoveStageModal
                stageId={selectedStageId}
                open={removeStageModalOpen}
                onClose={() => setRemoveStageModalOpen(false)}
            />
            <RemoveGroupModal
                groupId={selectedGroupId}
                open={removeGroupModalOpen}
                onClose={() => setRemoveGroupModalOpen(false)}
            />
            {selectedStageId && selectedGroupId && (
                <InviteModal
                    stageId={selectedStageId}
                    groupId={selectedGroupId}
                    open={inviteModalOpen}
                    onClose={() => setInviteModalOpen(false)}
                />
            )}
        </Container>
    )
}
export default Stages

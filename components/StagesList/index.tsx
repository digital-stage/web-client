import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import React, { useState } from 'react'
import { FaArrowRight, FaEdit, FaPlus, FaShareSquare, FaTrash } from 'react-icons/fa'
import { ClientDeviceEvents, Group, Stage } from '@digitalstage/api-types'
import Image from 'next/image'
import BlackPanel from '../../fastui/components/panels/BlackPanel'
import Button, { DangerButton } from '../../fastui/components/interaction/Button'
import StageModal from './modals/StageModal'
import GroupModal from './modals/GroupModal'
import RemoveStageModal from './modals/RemoveStageModal'
import RemoveGroupModal from './modals/RemoveGroupModal'
import InviteModal from './modals/InviteModal'
import useStageJoiner from '../../lib/useStageJoiner'
import List, { ListItem } from '../../fastui/components/List'
import styles from './StagesList.module.css'
import Collapse from '../../fastui/components/interaction/Collapse'

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
                <div>
                    <Button kind="minimal" onClick={onGroupModalRequested} icon={<FaEdit />}>
                        Bearbeiten
                    </Button>
                    <Button kind="minimal" onClick={onInviteModalRequested} icon={<FaEdit />}>
                        Einladen
                    </Button>
                    <Button kind="minimal" onClick={onRemoveGroupModalRequested} icon={<FaTrash />}>
                        Entfernen
                    </Button>
                </div>
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
    const localUserId = useStageSelector<string | undefined>((state) => state.globals.localUserId)
    const isStageAdmin = localUserId && stage && stage.admins.some((admin) => admin === localUserId)
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[id])
    return (
        <Collapse
            initialCollapsed
            icon={<Image width="30" height="30" src="/static/stage.svg" />}
            title={<h3>{stage.name}</h3>}
            actions={
                isStageAdmin && (
                    <div>
                        <Button
                            className={styles.editStageButton}
                            kind="secondary"
                            title="Bühne bearbeiten"
                            round
                            size="small"
                            onClick={onStageModalRequested}
                        >
                            <FaEdit size={18} />
                        </Button>
                        <Button
                            kind="danger"
                            title="Bühne entfernen"
                            round
                            size="small"
                            onClick={onRemoveStageModalRequested}
                        >
                            <FaTrash size={18} />
                        </Button>
                    </div>
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
                        <div>
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
                        </div>
                    </>
                )}
            </List>
        </Collapse>
    )
}

const StagesList = () => {
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    const [inviteModalOpen, setInviteModalOpen] = useState<boolean>(false)
    const [stageModalOpen, setStageModalOpen] = useState<boolean>(false)
    const [groupModalOpen, setGroupModalOpen] = useState<boolean>(false)
    const [removeStageModalOpen, setRemoveStageModalOpen] = useState<boolean>(false)
    const [removeGroupModalOpen, setRemoveGroupModalOpen] = useState<boolean>(false)

    const [selectedStageId, setSelectedStageId] = useState<string>()
    const [selectedGroupId, setSelectedGroupId] = useState<string>()
    return (
        <>
            <BlackPanel className={styles.panel}>
                <div className={styles.nav}>
                    <div className={styles.navItem}>
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
                    </div>
                    <div className={styles.navItem}>
                        <Button kind="minimal" icon={<FaArrowRight />}>
                            &nbsp;Neue Teilnahme
                        </Button>
                    </div>
                </div>
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
            </BlackPanel>
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
        </>
    )
}
export default StagesList

import React from 'react'
import Image from 'next/image'
import { FaTrash, FaPlus, FaArrowRight } from 'react-icons/fa'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group, Stage } from '@digitalstage/api-types'
import { MdEdit } from 'react-icons/md'
import Block from '../components/ui/Block'
import Collapse from '../components/ui/Collapse'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import TransparentButton from '../components/ui/TransparentButton'
import List, { ListItem } from '../components/ui/List'
import styles from '../styles/Stages.module.css'
import PrimaryButton from '../components/ui/PrimaryButton'
import SecondaryButton from '../components/ui/SecondaryButton'
import DangerButton from '../components/ui/DangerButton'

const GroupRow = ({ id, stageId, isAdmin }: { id: string; stageId: string; isAdmin?: boolean }) => {
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
                            <SecondaryButton round size="small">
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
                        <PrimaryButton
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.JoinStage, {
                                    stageId,
                                    groupId: id,
                                    password: null,
                                } as ClientDevicePayloads.JoinStage)
                            }
                        >
                            <strong>Beitreten</strong>
                        </PrimaryButton>
                    )}
                </>
            }
        />
    )
}
GroupRow.defaultProps = {
    isAdmin: undefined,
}

const StageRow = ({ id }: { id: string }) => {
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
                    <FaTrash size={24} color="red" />
                    <FaTrash size={24} color="red" />
                    <FaTrash size={24} color="red" />
                </Block>
            }
        >
            <List>
                {groupIds &&
                    groupIds.map((groupId) => (
                        <GroupRow key={groupId} id={groupId} stageId={id} isAdmin={isStageAdmin} />
                    ))}
            </List>
        </Collapse>
    )
}

const Stages = () => {
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    return (
        <Container>
            <Block paddingTop={4} paddingBottom={4}>
                <h1>Meine Bühnen</h1>
                <Panel>
                    <Block style={{ borderBottom: '1px solid #676767' }}>
                        <Block padding={4} width={6} style={{ borderRight: '1px solid #676767' }}>
                            <TransparentButton icon={<FaPlus />}>
                                &nbsp;Neue Bühne erstellen
                            </TransparentButton>
                        </Block>
                        <Block padding={4} width={6}>
                            <TransparentButton icon={<FaArrowRight />}>
                                &nbsp;Neue Teilnahme
                            </TransparentButton>
                        </Block>
                    </Block>
                    {stageIds && stageIds.map((id) => <StageRow key={id} id={id} />)}
                </Panel>
            </Block>
        </Container>
    )
}
export default Stages

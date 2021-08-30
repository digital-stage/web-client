import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import React, { useState } from 'react'
import List, { ListItem } from '../../ui/List'
import styles from './StagesList.module.scss'
import { ClientDeviceEvents, Stage } from '@digitalstage/api-types'
import StageModal from './modals/StageModal'
import RemoveStageModal from './modals/RemoveStageModal'
import LeaveStageForGoodModal from './modals/LeaveStageForGoodModal'
import Tag from '../../ui/Tag'
import Paragraph from '../../ui/Paragraph'
import { MdDeleteForever, MdEdit, MdMore, MdMoreHoriz } from 'react-icons/md'
import { ImEnter, ImExit } from 'react-icons/im'
import EnterInviteCodeModal from './modals/EnterInviteCodeModal'
import { useStageJoiner } from '../../api/hooks/useStageJoiner'
import Link from 'next/link'
import { useRouter } from 'next/router'

const Type = {
    mediasoup: 'Web',
    jammer: 'Jammer',
    ov: 'OV',
}

const StageItem = ({
    stageId,
    onLeaveForGoodClicked,
    onEditStageClicked,
    onDeleteClicked,
}: {
    stageId: string
    onEditStageClicked: () => void
    onLeaveForGoodClicked: () => void
    onDeleteClicked: () => void
}) => {
    const { push } = useRouter()
    const { name, admins, password, videoType, audioType } = useStageSelector<{
        name: string
        admins: string[]
        password?: string
        videoType: string
        audioType: string
    }>((state) => {
        const { name, admins, password, videoType, audioType } = state.stages.byId[stageId]
        return {
            name,
            admins,
            password,
            videoType,
            audioType,
        }
    }, shallowEqual)
    const userId = useStageSelector((state) => state.globals.localUserId)
    const hasGroups = useStageSelector((state) => state.groups.byStage[stageId]?.length > 0)
    const isActive = useStageSelector(
        (state) => state.globals.stageId && state.globals.stageId === stageId
    )
    const isStageAdmin = React.useMemo(() => admins.find((id) => id === userId), [admins, userId])
    const { join, leave } = useStageJoiner()
    const emit = useEmit()
    const onListClicked = React.useCallback(() => {
        if (hasGroups) {
            if (isActive) {
                return leave()
            } else {
                return join({ stageId, password: password })
            }
        }
        push(`/stages/${stageId}`)
    }, [hasGroups, isActive, join, leave, password, push, stageId])
    const onEditClicked = React.useCallback(
        (e) => {
            e.stopPropagation()
            onEditStageClicked()
        },
        [onEditStageClicked]
    )
    return (
        <ListItem className={isActive ? styles.active : ''} onSelect={onListClicked}>
            <a className={styles.stageName}>
                {name}
                <Tag kind="success">{Type[videoType]}</Tag>
                <Tag kind="warn">{Type[audioType]}</Tag>
                <button className="round small" onClick={onEditClicked}>
                    <MdEdit />
                </button>
            </a>
            <span onClick={(e) => e.stopPropagation()}>
                {isActive ? (
                    <button
                        className="round danger small"
                        onClick={() => emit(ClientDeviceEvents.LeaveStage)}
                    >
                        <ImExit />
                    </button>
                ) : null}
                {isStageAdmin ? (
                    <Link href={`/stages/${stageId}`}>
                        <button className="round small">
                            <MdMoreHoriz />
                        </button>
                    </Link>
                ) : null}
                {isStageAdmin ? (
                    <button className="round danger small" onClick={onDeleteClicked}>
                        <MdDeleteForever />
                    </button>
                ) : (
                    <button className="round danger small" onClick={onLeaveForGoodClicked}>
                        <MdDeleteForever />
                    </button>
                )}
            </span>
        </ListItem>
    )
}

const StagesList = () => {
    const [enterCodeRequested, requestEnterCode] = useState<boolean>(false)
    const [editStageRequested, requestStageEdit] = useState<string>(undefined)
    const [removeStageRequested, requestStageRemoval] = useState<string>(undefined)
    const [leaveStageForGoodRequested, requestLeaveStageForGood] = useState<string>(undefined)
    const stageIds = useStageSelector((state) => state.stages.allIds)

    return (
        <List>
            {stageIds.map((stageId) => (
                <StageItem
                    key={stageId}
                    stageId={stageId}
                    onEditStageClicked={() => requestStageEdit(stageId)}
                    onLeaveForGoodClicked={() => requestLeaveStageForGood(stageId)}
                    onDeleteClicked={() => requestStageRemoval(stageId)}
                />
            ))}
            <Paragraph kind="micro" className={styles.legend}>
                Legende:
                <Tag kind="success">Videoübertragung</Tag>
                <Tag kind="warn">Audioübertragung</Tag>
            </Paragraph>
            <button className="tertiary" onClick={() => requestStageEdit(null)}>
                Neue Bühne erstellen
            </button>
            <button className="tertiary" onClick={() => requestEnterCode(true)}>
                Einladungscode eingeben
            </button>
            <EnterInviteCodeModal
                open={enterCodeRequested}
                onClose={() => requestEnterCode(false)}
            />
            <StageModal
                open={editStageRequested !== undefined}
                stageId={editStageRequested}
                onClose={() => requestStageEdit(undefined)}
            />
            <LeaveStageForGoodModal
                stageId={leaveStageForGoodRequested}
                open={!!leaveStageForGoodRequested}
                onClose={() => requestLeaveStageForGood(undefined)}
            />
            <RemoveStageModal
                stageId={removeStageRequested}
                open={!!removeStageRequested}
                onClose={() => requestStageRemoval(undefined)}
            />
        </List>
    )
}
export default StagesList

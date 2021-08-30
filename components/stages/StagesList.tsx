import { requestJoin, useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual, useDispatch } from 'react-redux'
import React, { useState } from 'react'
import List, { ListItem } from '../../ui/List'
import styles from './StagesList.module.scss'
import { ClientDeviceEvents, Stage } from '@digitalstage/api-types'
import StageModal from './modals/StageModal'
import RemoveStageModal from './modals/RemoveStageModal'
import LeaveStageForGoodModal from './modals/LeaveStageForGoodModal'
import Tag from '../../ui/Tag'
import Paragraph from '../../ui/Paragraph'
import { MdDeleteForever, MdEdit } from 'react-icons/md'
import { ImEnter, ImExit } from 'react-icons/im'
import EnterInviteCodeModal from './modals/EnterInviteCodeModal'
import { useStageJoiner } from '../../api/hooks/useStageJoiner'
import Link from 'next/link'

const Type = {
    mediasoup: 'Web',
    jammer: 'Jammer',
    ov: 'OV',
}

const StageItem = ({
    stageId,
    onEditClicked,
    onLeaveForGoodClicked,
    onDeleteClicked,
}: {
    stageId: string
    onEditClicked: () => void
    onLeaveForGoodClicked: () => void
    onDeleteClicked: () => void
}) => {
    const stage = useStageSelector<Stage | undefined>(
        (state) => state.stages.byId[stageId],
        shallowEqual
    )
    const userId = useStageSelector((state) => state.globals.localUserId)
    const hasGroups = useStageSelector((state) => state.groups.byStage[stageId]?.length > 0)
    const isActive = useStageSelector(
        (state) => state.globals.stageId && state.globals.stageId === stageId
    )
    const isStageAdmin = stage?.admins.find((id) => id === userId)
    const { join } = useStageJoiner()
    const emit = useEmit()
    return (
        <ListItem
            className={isActive ? styles.active : ''}
            onSelect={() => join({ stageId, password: stage.password })}
        >
            <a className={styles.stageName}>
                {stage.name}
                <Tag kind="success">{Type[stage.videoType]}</Tag>
                <Tag kind="warn">{Type[stage.audioType]}</Tag>
            </a>
            <span>
                <Link href={`/stages/${stageId}`}>
                    <a>
                        <MdEdit />
                    </a>
                </Link>
                {isStageAdmin ? (
                    <button className="round danger small" onClick={onDeleteClicked}>
                        <MdDeleteForever />
                    </button>
                ) : (
                    <button className="round danger small" onClick={onLeaveForGoodClicked}>
                        <MdDeleteForever />
                    </button>
                )}
                {hasGroups ? (
                    !isActive ? (
                        <button
                            className="round primary small"
                            onClick={() => join({ stageId: stageId, password: stage.password })}
                        >
                            <ImEnter />
                        </button>
                    ) : (
                        <button
                            className="round danger small"
                            onClick={() => emit(ClientDeviceEvents.LeaveStage)}
                        >
                            <ImExit />
                        </button>
                    )
                ) : null}
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
                    onEditClicked={() => requestStageEdit(stageId)}
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

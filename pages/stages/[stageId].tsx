import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { useConnection, useStageJoiner, useStageSelector } from '@digitalstage/api-client-react'
import Link from 'next/link'
import Loading from '../../components/global/Loading'
import AltList, { AltListItem } from 'ui/AltList'
import { ClientDeviceEvents, Group, Stage } from '@digitalstage/api-types'
import styles from './Stages.module.scss'
import RemoveStageModal from 'components/stages/modals/RemoveStageModal'
import RemoveGroupModal from 'components/stages/modals/RemoveGroupModal'
import GroupModal from 'components/stages/modals/GroupModal'
import StageModal from 'components/stages/modals/StageModal'
import InviteModal from '../../components/stages/modals/InviteModal'
import { MdDeleteForever, MdEdit } from 'ui/Icons'
import Container from 'ui/Container'
import LeaveStageForGoodModal from '../../components/stages/modals/LeaveStageForGoodModal'
import { shallowEqual } from 'react-redux'
import Paragraph from '../../ui/Paragraph'

const StageView = () => {
    // Dependencies
    const { query } = useRouter()
    const stageId = useMemo<string | undefined>(() => {
        const { stageId } = query
        if (Array.isArray(stageId)) return stageId.pop()
        return stageId
    }, [query])
    const { emit } = useConnection()
    const { currentStageId, currentGroupId } = useStageSelector((state) =>
        state.globals.stageId
            ? { currentStageId: state.globals.stageId, currentGroupId: state.globals.groupId }
            : { currentStageId: undefined, currentGroupId: undefined }
    )
    const stage = useStageSelector<Stage | undefined>(
        (state) => (stageId && !Array.isArray(stageId) ? state.stages.byId[stageId] : undefined),
        shallowEqual
    )
    const groups = useStageSelector<Group[]>((state) =>
        stage && state.groups.byStage[stage._id]
            ? state.groups.byStage[stage._id].map((id) => state.groups.byId[id])
            : []
    )
    const userId = useStageSelector((state) => state.globals.localUserId)
    const isStageAdmin = stage?.admins.find((id) => id === userId)
    const { requestJoin } = useStageJoiner()

    // Internal state
    const [inviteCodeRequested, requestInviteCode] = useState<string>(undefined)
    const [groupEditRequested, requestGroupEdit] = useState<string>(undefined)
    const [stageEditRequested, requestStageEdit] = useState<boolean>(false)
    const [groupRemovalRequested, requestGroupRemoval] = useState<string>(undefined)
    const [stageRemovalRequested, requestStageRemoval] = useState<boolean>(false)
    const [leaveStageForGoodRequested, requestLeaveStageForGood] = useState<boolean>(false)

    if (emit && stage) {
        return (
            <Container size="small">
                <Link href="/stages" passHref>
                    <button>Zurück zur Bühnenübersicht</button>
                </Link>
                <h2 className={styles.title}>
                    {stage.name}
                    {isStageAdmin ? (
                        <button className="" onClick={() => requestStageEdit(true)}>
                            Einstellungen
                        </button>
                    ) : null}
                </h2>
                <div className={styles.row}>
                    <div className={styles.stageActions}>
                        <button onClick={() => requestGroupEdit(null)}>
                            Neue Gruppe erstellen
                        </button>
                    </div>
                </div>

                {groups ? (
                    <div className={styles.row}>
                        <AltList>
                            {groups.map((group) => (
                                <AltListItem key={group._id}>
                                    <div className={styles.groupRow}>
                                        <div className={styles.groupName}>
                                            <div
                                                style={{ backgroundColor: group.color }}
                                                className={styles.groupColor}
                                            />
                                            {group.name}
                                        </div>
                                        <div className={styles.groupActions}>
                                            <div className={styles.groupAssignment}>
                                                {currentStageId === stage._id &&
                                                currentGroupId === group._id ? (
                                                    <button
                                                        onClick={() =>
                                                            emit(ClientDeviceEvents.LeaveStage)
                                                        }
                                                        className="danger small"
                                                    >
                                                        Gruppe verlassen
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            requestJoin({
                                                                stageId: stage._id,
                                                                groupId: group._id,
                                                                password: stage.password,
                                                            })
                                                        }
                                                        className="success small"
                                                    >
                                                        Gruppe betreten
                                                    </button>
                                                )}
                                            </div>
                                            <div className={styles.groupManagement}>
                                                <button
                                                    className="round small"
                                                    onClick={() => requestGroupEdit(group._id)}
                                                >
                                                    <MdEdit />
                                                </button>
                                                <button
                                                    className="small"
                                                    onClick={() => requestInviteCode(group._id)}
                                                >
                                                    Einladen
                                                </button>
                                                {isStageAdmin ? (
                                                    <>
                                                        <button
                                                            className="small"
                                                            onClick={() =>
                                                                requestGroupRemoval(group._id)
                                                            }
                                                        >
                                                            <MdDeleteForever />
                                                        </button>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </AltListItem>
                            ))}
                        </AltList>
                    </div>
                ) : null}
                <div className={styles.row}>
                    <Link href="/stages">
                        <a className="text">Zurück zur Bühnenübersicht</a>
                    </Link>
                </div>
                <div className={styles.dangerZone}>
                    <h3>Gefahrenzone</h3>
                    <Paragraph kind="micro">
                        Wenn Du die Bühne nicht mehr brauchst, kannst Du sie gerne löschen. Hierbei
                        werden alle Mitglieder und Gruppen entfernt. Die Bühne wird unwiederuflich
                        gelöscht!
                    </Paragraph>
                    <div className={styles.row}>
                        <button onClick={() => requestStageRemoval(true)} className="danger">
                            Bühne entgültig entfernen
                        </button>
                    </div>
                </div>
                <StageModal
                    stageId={stageId}
                    onClose={() => requestStageEdit(false)}
                    open={stageEditRequested}
                />
                <GroupModal
                    stageId={stageId}
                    groupId={groupEditRequested}
                    onClose={() => requestGroupEdit(undefined)}
                    open={groupEditRequested !== undefined}
                />
                <InviteModal
                    stageId={stageId}
                    groupId={inviteCodeRequested}
                    onClose={() => requestInviteCode(undefined)}
                    open={!!inviteCodeRequested}
                />
                <LeaveStageForGoodModal
                    stageId={stageId}
                    onClose={() => requestLeaveStageForGood(false)}
                    open={!!leaveStageForGoodRequested}
                />
                <RemoveGroupModal
                    groupId={groupRemovalRequested}
                    onClose={() => requestGroupRemoval(undefined)}
                    open={!!groupRemovalRequested}
                />
                <RemoveStageModal
                    stageId={stageId}
                    onClose={() => requestStageRemoval(false)}
                    open={stageRemovalRequested}
                />
            </Container>
        )
    }
    return Loading
}
export default StageView

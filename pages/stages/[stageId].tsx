import React, {useMemo, useState} from 'react'
import {useRouter} from 'next/router'
import {
    useEmit,
    useStageAdminSelector,
    useStageJoiner,
    useStageSelector,
} from '@digitalstage/api-client-react'
import Link from 'next/link'
import {Loading} from '../../components/global/Loading'
import {AltList, AltListItem} from 'ui/AltList'
import {ClientDeviceEvents, ClientDevicePayloads, Group, Stage} from '@digitalstage/api-types'
import styles from './Stages.module.scss'
import {RemoveStageModal} from 'components/stages/modals/RemoveStageModal'
import {RemoveGroupModal} from 'components/stages/modals/RemoveGroupModal'
import {GroupModal} from 'components/stages/modals/GroupModal'
import {StageModal} from 'components/stages/modals/StageModal'
import {InviteModal} from '../../components/stages/modals/InviteModal'
import {Container} from 'ui/Container'
import {LeaveStageForGoodModal} from '../../components/stages/modals/LeaveStageForGoodModal'
import {shallowEqual} from 'react-redux'
import {IoIosArrowDropleft} from 'react-icons/io'
import {MdDeleteForever, MdEdit} from 'react-icons/md'
import {Switch} from 'ui/Switch'

const StageMemberItem = ({
                             stageId,
                             stageMemberId,
                             hasAdminRights
                         }: { stageId: string, stageMemberId: string, hasAdminRights: boolean }) => {
    const adminUserIds = useStageSelector(state => state.stages.byId[stageId].admins)
    const soundEditorUserIds = useStageSelector(state => state.stages.byId[stageId].soundEditors)
    const userId = useStageSelector(state => state.stageMembers.byId[stageMemberId].userId)
    const username = useStageSelector(state => state.users.byId[state.stageMembers.byId[stageMemberId].userId].name)
    const emit = useEmit()

    const isAdmin = adminUserIds.some(id => id === userId)

    return (
        <AltListItem>
            <div className={styles.stageMemberRow}>
                <h5>
                    {username}
                </h5>
                {hasAdminRights ? (
                    <div className={styles.stageMemberActions}>
                        <label>
                            Global mischen
                            <Switch
                                round={true}
                                size="small"
                                checked={soundEditorUserIds.some(id => id === userId)}
                                onChange={e => {
                                    //TODO: Write react callbacks
                                    if (e.currentTarget.checked) {
                                        // Add user
                                        emit(ClientDeviceEvents.ChangeStage, {
                                            _id: stageId,
                                            soundEditors: [...soundEditorUserIds, userId]
                                        } as ClientDevicePayloads.ChangeStage)
                                    } else {
                                        // Remove user
                                        emit(ClientDeviceEvents.ChangeStage, {
                                            _id: stageId,
                                            soundEditors: soundEditorUserIds.filter(id => id !== userId)
                                        } as ClientDevicePayloads.ChangeStage)
                                    }
                                }}
                            />
                        </label>
                        <label>
                            Admin
                            <Switch
                                round={true}
                                checked={isAdmin}
                                disabled={isAdmin && adminUserIds.length === 1}
                                onChange={e => {
                                    //TODO: Write react callbacks
                                    if (e.currentTarget.checked) {
                                        // Add user
                                        emit(ClientDeviceEvents.ChangeStage, {
                                            _id: stageId,
                                            admins: [...adminUserIds, userId]
                                        } as ClientDevicePayloads.ChangeStage)
                                    } else {
                                        // Remove user
                                        if (!isAdmin || adminUserIds.length > 1) {
                                            emit(ClientDeviceEvents.ChangeStage, {
                                                _id: stageId,
                                                admins: adminUserIds.filter(id => id !== userId)
                                            } as ClientDevicePayloads.ChangeStage)
                                        }
                                    }
                                }}
                            />
                        </label>
                        <button className="small danger" onClick={() => {
                            emit(ClientDeviceEvents.RemoveStageMember, stageMemberId as ClientDevicePayloads.RemoveStageMember)
                        }}>
                            Mitglied entfernen
                        </button>
                    </div>
                ) : null}
            </div>
        </AltListItem>
    )
}


const StageMemberList = ({
                             stageId,
                             groupId,
                             hasAdminRights
                         }: { stageId: string, groupId: string, hasAdminRights: boolean }) => {
    const stageMemberIds = useStageSelector(state => state.stageMembers.byGroup[groupId] || [])

    return (
        <>
            {stageMemberIds.map(stageMemberId => <StageMemberItem key={stageMemberId}
                                                                  stageId={stageId}
                                                                  stageMemberId={stageMemberId}
                                                                  hasAdminRights={hasAdminRights}
            />)}
        </>
    )
}

const StageView = () => {
    // Dependencies
    const {query, replace} = useRouter()
    const stageId = useMemo<string | undefined>(() => {
        const {stageId} = query
        if (Array.isArray(stageId)) return stageId.pop()
        return stageId
    }, [query])
    const emit = useEmit()
    const {currentStageId, currentGroupId} = useStageSelector((state) =>
        state.globals.stageId
            ? {currentStageId: state.globals.stageId, currentGroupId: state.globals.groupId}
            : {currentStageId: undefined, currentGroupId: undefined}
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
    const isStageAdmin = useStageAdminSelector(stageId)
    const {join} = useStageJoiner()

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
                <Link href="/stages">
                    <a
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        <IoIosArrowDropleft/>
                        &nbsp;Zurück zur Übersicht
                    </a>
                </Link>
                <h3 className={styles.title}>
                    {stage.name}
                    {isStageAdmin ? (
                        <button className="" onClick={() => requestStageEdit(true)}>
                            <MdEdit/>
                        </button>
                    ) : null}
                </h3>
                {isStageAdmin ? (
                    <div className={styles.row}>
                        <div className={styles.stageActions}>
                            <button onClick={() => requestGroupEdit(null)}>
                                Neue Gruppe erstellen
                            </button>
                        </div>
                    </div>
                ) : null}

                {groups ? (
                    <div className={styles.row}>
                        <AltList>
                            {groups.map((group) => (
                                <>
                                    <AltListItem key={group._id}>
                                        <div className={styles.groupRow}>
                                            <div className={styles.groupName}>
                                                <div
                                                    style={{backgroundColor: group.color}}
                                                    className={styles.groupColor}
                                                />
                                                {group.name}
                                            </div>
                                            <div className={styles.groupActions}>
                                                <div className={styles.groupAssignment}>
                                                    {currentStageId === stage._id ? (
                                                        <>
                                                            {currentGroupId === group._id ? (
                                                                <button
                                                                    onClick={() =>
                                                                        emit(
                                                                            ClientDeviceEvents.LeaveStage
                                                                        )
                                                                    }
                                                                    className="danger small"
                                                                >
                                                                    Gruppe verlassen
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        join({
                                                                            stageId: stage._id,
                                                                            groupId: group._id,
                                                                            password: stage.password,
                                                                        })
                                                                    }
                                                                    className="success small"
                                                                >
                                                                    Zu dieser Gruppe wechseln
                                                                </button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button
                                                            onClick={() =>
                                                                join({
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
                                                {isStageAdmin ? (
                                                    <div className={styles.groupManagement}>
                                                        <button
                                                            className="round small warn"
                                                            onClick={() => requestGroupEdit(group._id)}
                                                        >
                                                            <MdEdit/>
                                                        </button>
                                                        <button
                                                            className="small primary"
                                                            onClick={() => requestInviteCode(group._id)}
                                                        >
                                                            Einladen
                                                        </button>
                                                        <button
                                                            className="danger small"
                                                            onClick={() =>
                                                                requestGroupRemoval(group._id)
                                                            }
                                                        >
                                                            <MdDeleteForever/>
                                                        </button>
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </AltListItem>
                                    <StageMemberList stageId={stageId} groupId={group._id}
                                                     hasAdminRights={isStageAdmin}/>
                                </>
                            ))}
                        </AltList>
                    </div>
                ) : null}
                {!isStageAdmin ? (
                    <div className={styles.row}>
                        <button className="danger" onClick={() => requestLeaveStageForGood(true)}>
                            Bühne entgültig verlassen
                        </button>
                    </div>
                ) : null}
                <div className={styles.row}>
                    <Link href="/stages">
                        <a
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                            }}
                        >
                            <IoIosArrowDropleft/>
                            &nbsp;Zurück zur Übersicht
                        </a>
                    </Link>
                </div>
                {isStageAdmin ? (
                    <div className={styles.dangerZone}>
                        <h3>Gefahrenzone</h3>
                        <p className="micro">
                            Wenn Du die Bühne nicht mehr brauchst, kannst Du sie gerne löschen.
                            Hierbei werden alle Mitglieder und Gruppen entfernt. Die Bühne wird
                            unwiederuflich gelöscht!
                        </p>
                        <div className={styles.row}>
                            <button onClick={() => requestStageRemoval(true)} className="danger">
                                Bühne entgültig entfernen
                            </button>
                        </div>
                    </div>
                ) : null}

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
                    onLeave={() => replace('/stages')}
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
                    onDelete={() => replace('/stages')}
                    open={stageRemovalRequested}
                />
            </Container>
        )
    }
    return Loading
}
export default StageView

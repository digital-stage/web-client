/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React, {useMemo, useState} from 'react'
import {useRouter} from 'next/router'
import {
    selectIsCurrentlyAdmin,
    useEmit,
    useStageJoiner,
    useStageSelector,
} from '@digitalstage/api-client-react'
import Link from 'next/link'
import {Loading} from '../../components/global/Loading'
import {AltList, AltListItem} from 'ui/AltList'
import {ClientDeviceEvents, ClientDevicePayloads, Group, Stage} from '@digitalstage/api-types'
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
import {Heading3, Heading5} from "../../ui/Heading";
import {Paragraph} from "../../ui/Paragraph";

const StageMemberItem = ({
                             stageId,
                             stageMemberId,
                             hasAdminRights
                         }: { stageId: string, stageMemberId: string, hasAdminRights: boolean }) => {
    const adminUserIds = useStageSelector(state => state.stages.byId[stageId].admins)
    const soundEditorUserIds = useStageSelector(state => state.stages.byId[stageId].soundEditors)
    const userId = useStageSelector(state => state.stageMembers.byId[stageMemberId].userId)
    const username = useStageSelector(state => state.stageMembers.byId[stageMemberId].userId && state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name)
    const emit = useEmit()

    const isAdmin = adminUserIds.some(id => id === userId)

    if (emit) {

        return (
            <AltListItem>
                <div className="stageMemberRow">
                    <Heading5>
                        {username}
                    </Heading5>
                    {hasAdminRights ? (
                        <div className="stageMemberActions">
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
    return null
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
    const {isReady, query, replace} = useRouter()
    const stageId = useMemo<string | undefined>(() => {
        if (isReady) {
            return Array.isArray(query.stageId) ? query.stageId[0] : query.stageId
        }
        return undefined
    }, [isReady, query])
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
    const isStageAdmin = useStageSelector(selectIsCurrentlyAdmin)
    const {join} = useStageJoiner()

    // Internal state
    const [inviteCodeRequested, requestInviteCode] = useState<string | undefined>(undefined)
    const [groupEditRequested, requestGroupEdit] = useState<string | null | undefined>(undefined)
    const [stageEditRequested, requestStageEdit] = useState<boolean>(false)
    const [groupRemovalRequested, requestGroupRemoval] = useState<string | undefined>(undefined)
    const [stageRemovalRequested, requestStageRemoval] = useState<boolean>(false)
    const [leaveStageForGoodRequested, requestLeaveStageForGood] = useState<boolean>(false)

    if (emit && stage) {
        return (
            <Container className="stageDetails" size="small">
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
                <Heading3 className="title">
                    {stage.name}
                    {isStageAdmin ? (
                        <button className="" onClick={() => requestStageEdit(true)}>
                            <MdEdit/>
                        </button>
                    ) : null}
                </Heading3>
                {isStageAdmin ? (
                    <div className="row">
                        <div className="stageActions">
                            <button onClick={() => requestGroupEdit(null)}>
                                Neue Gruppe erstellen
                            </button>
                        </div>
                    </div>
                ) : null}

                {groups ? (
                    <div className="row">
                        <AltList>
                            {groups.map((group) => (
                                <>
                                    <AltListItem key={group._id}>
                                        <div className="groupRow">
                                            <div className="groupName">
                                                <div
                                                    style={{backgroundColor: group.color}}
                                                    className="groupColor"
                                                />
                                                {group.name}
                                            </div>
                                            <div className="groupActions">
                                                <div className="groupAssignment">
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
                                                    <div className="groupManagement">
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
                                    {stageId && <StageMemberList stageId={stageId} groupId={group._id}
                                                                 hasAdminRights={isStageAdmin}/>}
                                </>
                            ))}
                        </AltList>
                    </div>
                ) : null}
                {!isStageAdmin ? (
                    <div className="row">
                        <button className="danger" onClick={() => requestLeaveStageForGood(true)}>
                            Bühne entgültig verlassen
                        </button>
                    </div>
                ) : null}
                <div className="row">
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
                    <div className="dangerZone">
                        <Heading3>Gefahrenzone</Heading3>
                        <Paragraph kind="micro">
                            Wenn Du die Bühne nicht mehr brauchst, kannst Du sie gerne löschen.
                            Hierbei werden alle Mitglieder und Gruppen entfernt. Die Bühne wird
                            unwiederuflich gelöscht!
                        </Paragraph>
                        <div className="row">
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
                {stageId && inviteCodeRequested && <InviteModal
                    stageId={stageId}
                    groupId={inviteCodeRequested}
                    onClose={() => requestInviteCode(undefined)}
                    open={!!inviteCodeRequested}
                />}
                <LeaveStageForGoodModal
                    stageId={stageId}
                    onClose={() => requestLeaveStageForGood(false)}
                    onLeave={() => replace('/stages')}
                    open={leaveStageForGoodRequested}
                />
                {groupRemovalRequested && <RemoveGroupModal
                    groupId={groupRemovalRequested}
                    onClose={() => requestGroupRemoval(undefined)}
                    open={!!groupRemovalRequested}
                />}
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

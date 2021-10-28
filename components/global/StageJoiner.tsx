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

import React from 'react'
import {useRouter} from 'next/router'
import {selectReady, useEmit, useNotification, useTrackedSelector} from '../../client'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    ErrorCodes,
} from '@digitalstage/api-types'
import {Modal, ModalButton, ModalFooter} from 'ui/Modal'
import {TextInput} from 'ui/TextInput'
import {useStageJoiner} from '../../client/hooks/useStageJoiner'
import {Heading4} from "../../ui/Heading";

/**
 * The StageJoiner is a usually hidden component,
 * that reacts to requested stage joins and displays errors if occuring
 *
 * @constructor
 */
const StageJoiner = (): JSX.Element | null => {
    const state = useTrackedSelector()
    const ready = selectReady(state)
    const {join, resetJoin} = useStageJoiner()
    const {stageId, groupId, password} =
        state.globals.request
            ? state.globals.request
            : {
                stageId: undefined,
                groupId: undefined,
                password: undefined,
            }
    const emit = useEmit()
    const [retries, setRetries] = React.useState<number>(0)
    const [wrongPassword, setWrongPassword] = React.useState<boolean>(false)
    const [notFound, setNotFound] = React.useState<boolean>(false)
    const [groupMissing, setGroupMissing] = React.useState<boolean>(false)
    const {push} = useRouter()
    const [intPassword, setIntPassword] = React.useState<string>()
    const notify = useNotification()

    const clear = React.useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        setGroupMissing(false)
        setRetries(0)
        resetJoin()
    }, [resetJoin])

    const handleJoinRequest = React.useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        setGroupMissing(false)
        // Try to connect
        if (emit && stageId && notify) {
            emit(
                ClientDeviceEvents.JoinStage,
                {stageId, groupId, password} as ClientDevicePayloads.JoinStage,
                (err: string | null) => {
                    if (err) {
                        if (err === ErrorCodes.InvalidPassword) {
                            return setWrongPassword(true)
                        }
                        if (err == ErrorCodes.StageNotFound) {
                            return setNotFound(true)
                        }
                        if (err == ErrorCodes.GroupIdMissing) {
                            return setGroupMissing(true)
                        }
                        console.error(err)
                        return notify({
                            kind: 'error',
                            message: err,
                        })
                    }
                    clear()
                    return push('/stage')
                }
            )
        }
    }, [emit, stageId, groupId, password, clear, push, notify])

    React.useEffect(() => {
        if (ready) {
            handleJoinRequest()
        }
    }, [ready, handleJoinRequest])

    const groups = stageId && state.groups.byStage[stageId]
        ? state.groups.byStage[stageId].map((id) => state.groups.byId[id])
        : []

    if (stageId)
        return (
            <>
                <Modal size="small" open={notFound} onClose={() => setNotFound(false)}>
                    <Heading4>Bühne nicht gefunden</Heading4>
                    <ModalFooter>
                        <ModalButton onClick={() => setNotFound(false)}>Ok</ModalButton>
                    </ModalFooter>
                </Modal>
                <Modal open={groupMissing} onClose={() => setGroupMissing(false)}>
                    <Heading4>Bitte wähle eine Gruppe:</Heading4>
                    {groups.map((group) => (
                        <button
                            key={group._id}
                            className=""
                            onClick={() =>
                                join({
                                    stageId,
                                    groupId: group._id,
                                    password,
                                })
                            }
                        >
                            {group.name}
                        </button>
                    ))}
                    <ModalFooter>
                        <ModalButton
                            className="danger"
                            onClick={() => {
                                setGroupMissing(false)
                                clear()
                            }}
                        >
                            Abbrechen
                        </ModalButton>
                    </ModalFooter>
                </Modal>
                <Modal open={wrongPassword} onClose={() => clear()}>
                    <Heading4>{retries === 0 ? 'Passwort notwendig' : 'Falsches Passwort'}</Heading4>
                    <TextInput
                        id="password"
                        label="Password"
                        name="password"
                        value={intPassword}
                        onChange={(e) => setIntPassword(e.currentTarget.value)}
                        type="password"
                    />
                    <ModalFooter>
                        <ModalButton onClick={() => clear()}>Abbrechen</ModalButton>
                        <ModalButton
                            onClick={() => {
                                setRetries((prev) => prev + 1)
                                join({
                                    stageId,
                                    groupId,
                                    password: intPassword || null,
                                })
                            }}
                        >
                            Erneut versuchen
                        </ModalButton>
                    </ModalFooter>
                </Modal>
            </>
        )
    return null
}

export {StageJoiner}

import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import { useEmit, useNotification, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, ErrorCodes } from '@digitalstage/api-types'
import Modal, { ModalButton, ModalFooter } from '../../ui/Modal'
import TextInput from '../../ui/TextInput'
import { useStageJoiner } from '../../api/hooks/useStageJoiner'

/**
 * The StageJoiner is a usually hidden component,
 * that reacts to requested stage joins and displays errors if occuring
 *
 * @constructor
 */
const StageJoiner = (): JSX.Element | null => {
    const ready = useStageSelector((state) => state.globals.ready)
    const { join, resetJoin } = useStageJoiner()
    const { stageId, groupId, password } = useStageSelector((state) =>
        state.globals.request
            ? state.globals.request
            : {
                  stageId: undefined,
                  groupId: undefined,
                  password: undefined,
              }
    )
    const emit = useEmit()
    const [retries, setRetries] = useState<number>(0)
    const [wrongPassword, setWrongPassword] = useState<boolean>(false)
    const [notFound, setNotFound] = useState<boolean>(false)
    const router = useRouter()
    const [intPassword, setIntPassword] = useState<string>()
    const notify = useNotification()

    const clear = useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        setRetries(0)
        resetJoin()
    }, [resetJoin])

    const handleJoinRequest = useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        // Try to connect
        if (emit && stageId && notify) {
            emit(
                ClientDeviceEvents.JoinStage,
                { stageId, groupId, password } as ClientDevicePayloads.JoinStage,
                (err: string | null) => {
                    if (err) {
                        if (err === ErrorCodes.InvalidPassword) {
                            return setWrongPassword(true)
                        } else if (err == ErrorCodes.StageNotFound) {
                            return setNotFound(true)
                        }
                        console.error(err)
                        return notify({
                            kind: 'error',
                            message: err,
                        })
                    }
                    clear()
                    return router.push('/stage')
                }
            )
        }
    }, [emit, stageId, groupId, password, clear, router, notify])

    React.useEffect(() => {
        if (ready) {
            handleJoinRequest()
        }
    }, [ready, handleJoinRequest])

    if (stageId)
        return (
            <>
                <Modal size="small" open={notFound} onClose={() => setNotFound(false)}>
                    <h4>Bühne nicht gefunden</h4>
                    <ModalFooter>
                        <ModalButton onClick={() => setNotFound(false)}>Ok</ModalButton>
                    </ModalFooter>
                </Modal>
                <Modal open={wrongPassword} onClose={() => clear()}>
                    <h4>{retries === 0 ? 'Passwort notwendig' : 'Falsches Passwort'}</h4>
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
                                    password: intPassword ? intPassword : null,
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

export default StageJoiner

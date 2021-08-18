import React, { useCallback, useState } from 'react'
import { useRouter } from 'next/router'
import { useConnection, useStageJoiner, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import Modal, { ModalButton, ModalFooter } from '../../ui/Modal'
import TextInput from '../../ui/TextInput'

interface ErrorCodes {
    InvalidPassword: 'Invalid password'
    NotFound: 'Not found'
}

/**
 * The StageJoiner is a usually hidden component,
 * that reacts to requested stage joins and displays errors if occuring
 *
 * @constructor
 */
const StageJoiner = (): JSX.Element | null => {
    const ready = useStageSelector((state) => state.globals.ready)
    const { stageId, groupId, password, reset, requestJoin } = useStageJoiner()
    const { emit } = useConnection()
    const [retries, setRetries] = useState<number>(0)
    const [wrongPassword, setWrongPassword] = useState<boolean>(false)
    const [notFound, setNotFound] = useState<boolean>(false)
    const router = useRouter()
    const [intPassword, setIntPassword] = useState<string>()

    const clear = useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        setRetries(0)
        reset()
    }, [reset])

    const joinStage = useCallback(() => {
        setNotFound(false)
        setWrongPassword(false)
        // Try to connect
        if (emit && stageId) {
            emit(
                ClientDeviceEvents.JoinStage,
                { stageId, groupId, password } as ClientDevicePayloads.JoinStage,
                (err: string | null) => {
                    if (err) {
                        console.log(err)
                        if (err === 'Invalid password') {
                            return setWrongPassword(true)
                        }
                        return setNotFound(true)
                    }
                    clear()
                    return router.push('/stage')
                }
            )
        }
    }, [stageId, groupId, emit, password, clear, router])

    React.useEffect(() => {
        if (ready) {
            joinStage()
        }
    }, [ready, joinStage])

    if (stageId && groupId)
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
                                requestJoin({
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

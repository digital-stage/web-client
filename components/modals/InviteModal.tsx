import React, { useCallback, useEffect, useState } from 'react'
import { useConnection } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { BiReset } from 'react-icons/bi'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../ui/Modal'
import Notification from '../ui/Notification'
import Button from '../ui/Button'
import Block from '../ui/Block'
import Input from '../ui/Input'

const InviteModal = ({
    open,
    onClose,
    stageId,
    groupId,
}: {
    open: boolean
    onClose: () => void
    stageId: string
    groupId: string
}) => {
    const connection = useConnection()
    const [resetOpen, setResetOpen] = useState<boolean>(false)
    const [code, setCode] = useState<string>()
    const [error, setError] = useState<string>()

    const resetCode = useCallback((): Promise<string> => {
        if (connection && stageId && groupId) {
            return new Promise<string>((resolve, reject) =>
                connection.emit(
                    ClientDeviceEvents.RevokeInviteCode,
                    { stageId, groupId } as ClientDevicePayloads.RevokeInviteCode,
                    (err: string | null, code_?: string) => {
                        if (err) reject(err)
                        resolve(code_)
                    }
                )
            )
        }
        throw new Error(`Internal error: not ready: ${stageId} and ${groupId}`)
    }, [connection, stageId, groupId])

    useEffect(() => {
        if (connection && stageId && groupId) {
            console.log('FETCH')
            connection.emit(
                ClientDeviceEvents.EncodeInviteCode,
                { stageId, groupId } as ClientDevicePayloads.EncodeInviteCode,
                (err: string | null, code_?: string) => {
                    if (err) {
                        return setError(err)
                    }
                    setError(undefined)
                    setCode(code_)
                    return code_
                }
            )
        }
    }, [connection, stageId, groupId])

    return (
        <Modal size="small" open={open} onClose={onClose}>
            <ModalHeader>
                <h3>Einladen</h3>
            </ModalHeader>
            <Block width="full" align="center" justify="center">
                <Input type="text" readOnly value={code} label="Einladungscode" />
                <Button round onClick={() => setResetOpen(true)}>
                    <BiReset />
                </Button>
            </Block>
            <Block justify="center">
                <Block padding={2}>
                    <Button>Code kopieren</Button>
                </Block>
                <Block padding={2}>
                    <Button>Link kopieren</Button>
                </Block>
            </Block>
            {error && <Notification type="error">{error}</Notification>}
            <ModalFooter>
                <ModalButton onClick={onClose}>Schließen</ModalButton>
            </ModalFooter>

            <Modal size="small" open={resetOpen} onClose={() => setResetOpen(false)}>
                REALY?
                <ModalFooter>
                    <ModalButton onClick={() => setResetOpen(false)}>Abbrechen</ModalButton>
                    <ModalButton
                        onClick={() =>
                            resetCode()
                                .then((code_) => setCode(code_))
                                .then(() => setError(undefined))
                                .then(() => setResetOpen(false))
                                .catch((err) => setError(err))
                        }
                    >
                        Code neu generieren
                    </ModalButton>
                </ModalFooter>
            </Modal>
        </Modal>
    )
}
InviteModal.defaultProps = {
    scope: undefined,
}
export default InviteModal

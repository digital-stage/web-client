import React, { useEffect, useState } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import Notificaton from '../../../ui/Notification'
import Paragraph from '../../../ui/Paragraph'
import dynamic from 'next/dynamic'
import { useEmit, useStageJoiner } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import styles from './EnterInviteCodeModal.module.scss'

const ReactCodeInput = dynamic(import('react-code-input'))

const EnterInviteCodeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [working, setWorking] = useState<boolean>(false)
    const [error, setError] = useState<string>()
    const [code, setCode] = useState<string>()
    const emit = useEmit()
    const { requestJoin } = useStageJoiner()

    useEffect(() => {
        if (emit && requestJoin && code && code?.length === 4) {
            setWorking(true)
            emit(
                ClientDeviceEvents.DecodeInviteCode,
                code as ClientDevicePayloads.DecodeInviteCode,
                (
                    error: string | null,
                    result?: { stageId: string; groupId: string; code: string }
                ) => {
                    if (result) {
                        requestJoin({
                            stageId: result.stageId,
                            groupId: result.groupId,
                        })
                    } else {
                        setError('Ungültiger Code')
                    }
                    setWorking(false)
                }
            )
        }
    }, [code, emit, requestJoin])

    useEffect(() => {
        if (code?.length < 4) setError(undefined)
    }, [code?.length])

    return (
        <Modal open={open} onClose={onClose} size="small">
            <ModalHeader>
                <h4>Einladungscode eingeben</h4>
            </ModalHeader>
            <Paragraph kind="micro" className={styles.center}>
                <ReactCodeInput
                    disabled={working}
                    name="Code"
                    inputMode="latin"
                    type="text"
                    fields={4}
                    onChange={(c) => {
                        setCode(c)
                    }}
                />
            </Paragraph>
            {error ? <Notificaton kind="error">{error}</Notificaton> : null}
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export default EnterInviteCodeModal

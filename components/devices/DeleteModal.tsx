import React, { useCallback, useState } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useConnection } from '@digitalstage/api-client-react'
import Paragraph from '../../ui/Paragraph'
import Notification from '../../ui/Notification'

const DeleteModal = ({ deviceId, onClose }: { deviceId: string; onClose: () => void }) => {
    const { emit } = useConnection()
    const [error, setError] = useState<string>()
    const deleteDevice = useCallback(() => {
        setError(undefined)
        emit(
            ClientDeviceEvents.RemoveDevice,
            deviceId as ClientDevicePayloads.RemoveDevice,
            (err: string | null) => {
                if (err) {
                    setError(err)
                }
                onClose()
            }
        )
    }, [deviceId, emit, onClose])
    return (
        <Modal size="small" open={!!deviceId} onClose={onClose}>
            <ModalHeader>Gerät löschen</ModalHeader>
            <Paragraph kind="micro">
                Das inaktive Gerät wird gelöscht. Du kannst es dann wieder erneut anmelden - jedoch
                verlierst Du alle Einstellungen, die das Gerät betreffen.
            </Paragraph>
            {error ? <Notification kind="error">{error}</Notification> : null}
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                <ModalButton onClick={deleteDevice}>Löschen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export default DeleteModal

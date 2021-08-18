import React, { useCallback } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useConnection } from '@digitalstage/api-client-react'
import Paragraph from '../../ui/Paragraph'

const DeleteModal = ({ deviceId, onClose }: { deviceId: string; onClose: () => void }) => {
    const { emit } = useConnection()
    const deleteDevice = useCallback(() => {
        emit(
            ClientDeviceEvents.RemoveDevice,
            deviceId as ClientDevicePayloads.RemoveDevice,
            (err: string | null) => {
                if (err) console.log(err)
            }
        )
    }, [deviceId, emit])
    return (
        <Modal size="small" open={!!deviceId} onClose={onClose}>
            <ModalHeader>Gerät löschen</ModalHeader>
            <Paragraph kind="micro">
                Das inaktive Gerät wird gelöscht. Du kannst es dann wieder erneut anmelden - jedoch
                verlierst Du alle Einstellungen, die das Gerät betreffen.
            </Paragraph>
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
                <ModalButton onClick={deleteDevice}>Löschen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export default DeleteModal

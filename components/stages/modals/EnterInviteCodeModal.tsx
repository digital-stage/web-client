import React, { useState } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import Notificaton from '../../../ui/Notification'
import Paragraph from '../../../ui/Paragraph'

const EnterInviteCodeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [error, setError] = useState<string>()
    return (
        <Modal open={open} onClose={onClose} size="small">
            <ModalHeader>
                <h4>Einladungscode eingeben</h4>
            </ModalHeader>
            <Paragraph kind="micro">CODE</Paragraph>
            {error ? <Notificaton kind="error">{error}</Notificaton> : null}
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export default EnterInviteCodeModal

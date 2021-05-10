import { ClientDeviceEvents, Group, useConnection } from '@digitalstage/api-client-react'
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import Modal from '../../ui/surface/Modal'
import Row from '../../ui/surface/Row'
import TertiaryButton from '../../ui/button/TertiaryButton'
import DangerButton from '../../ui/button/DangerButton'

const DeleteGroupModal = (props: { open: boolean; onClose: () => void; group: Group }) => {
    const { open, onClose, group } = props
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })
    const connection = useConnection()

    const deleteGroup = useCallback(() => {
        connection.emit(ClientDeviceEvents.RemoveGroup, group._id)
        onClose()
    }, [connection, group, onClose])

    return (
        <Modal open={open} onClose={onClose}>
            <h1>{f('deleteGroup')}</h1>
            <p>{f('deleteGroupDescription')}</p>
            <Row align="space-between">
                <TertiaryButton onClick={onClose}>{f('cancel')}</TertiaryButton>
                <DangerButton onClick={deleteGroup}>{f('delete')}</DangerButton>
            </Row>
        </Modal>
    )
}
export default DeleteGroupModal

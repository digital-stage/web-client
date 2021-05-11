import { ClientDeviceEvents, Stage, useConnection } from '@digitalstage/api-client-react'
import React, { useCallback } from 'react'
import { useIntl } from 'react-intl'
import Modal from '../../../ui/surface/Modal'
import Row from '../../../ui/surface/Row'
import TertiaryButton from '../../../ui/button/TertiaryButton'
import DangerButton from '../../../ui/button/DangerButton'

const DeleteStageModal = (props: { open: boolean; onClose: () => void; stage: Stage }) => {
    const { open, onClose, stage } = props
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })
    const connection = useConnection()

    const deleteStage = useCallback(() => {
        connection.emit(ClientDeviceEvents.RemoveStage, stage._id)
        onClose()
    }, [connection, stage, onClose])

    return (
        <Modal open={open} onClose={onClose}>
            <h1>{f('deleteStage')}</h1>
            <p>{f('deleteStageDescription')}</p>
            <Row align="space-between">
                <TertiaryButton onClick={onClose}>{f('cancel')}</TertiaryButton>
                <DangerButton onClick={deleteStage}>{f('delete')}</DangerButton>
            </Row>
        </Modal>
    )
}
export default DeleteStageModal

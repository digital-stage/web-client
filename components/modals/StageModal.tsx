import { useStageSelector } from '@digitalstage/api-client-react'
import { Stage } from '@digitalstage/api-types'
import React from 'react'
import Modal, { ModalHeader } from '../ui/Modal'
import StageForm from '../forms/StageForm'

const StageModal = ({
    open,
    onClose,
    stageId,
}: {
    open: boolean
    onClose: () => void
    stageId?: string
}) => {
    const stage = useStageSelector<Stage | undefined>(
        (state) => stageId && state.stages.byId[stageId]
    )
    return (
        <Modal open={open} onClose={onClose}>
            <ModalHeader>
                <h2>{stage ? 'Bühne bearbeiten' : 'Neue Bühne erstellen'}</h2>
            </ModalHeader>
            <StageForm stage={stage} onSave={onClose} onAbort={onClose} />
        </Modal>
    )
}
StageModal.defaultProps = {
    stageId: undefined,
}
export default StageModal

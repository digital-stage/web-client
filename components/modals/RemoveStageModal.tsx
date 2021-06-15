import { Stage, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useCallback } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../../ui/Modal'
import Paragraph from '../ui/Paragraph'

const RemoveStageModal = ({
    stageId,
    open,
    onClose,
}: {
    stageId?: string
    open: boolean
    onClose: () => void
}) => {
    const stage = useStageSelector<Stage | undefined>(
        (state) => stageId && state.stages.byId[stageId]
    )
    const connection = useConnection()
    const removeStage = useCallback(() => {
        if (connection) {
            connection.emit(
                ClientDeviceEvents.RemoveStage,
                stageId as ClientDevicePayloads.RemoveStage
            )
        }
        onClose()
    }, [stageId, connection])
    if (stage) {
        return (
            <Modal open={open} onClose={onClose} size="small">
                <ModalHeader>
                    <h4>Bühne {stage.name || stage._id} wirklich löschen?</h4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Bühne und alle Gruppen sowie Teilnehmer werden unwiderruflich gelöscht und
                    sind nicht mehr verfügbar!
                </Paragraph>
                <ModalFooter>
                    <ModalButton kind="tertiary" onClick={onClose}>
                        Nein
                    </ModalButton>
                    <ModalButton kind="danger" onClick={removeStage}>
                        Ja, Bühne wirklich löschen
                    </ModalButton>
                </ModalFooter>
            </Modal>
        )
    }
    return null
}
RemoveStageModal.defaultProps = {
    stageId: undefined,
}
export default RemoveStageModal

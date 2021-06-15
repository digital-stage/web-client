import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group } from '@digitalstage/api-types'
import { useCallback } from 'react'
import Modal, { ModalButton, ModalFooter, ModalHeader } from '../../../ui/Modal'
import Paragraph from '../../../components/ui/Paragraph'

const RemoveGroupModal = ({
    groupId,
    open,
    onClose,
}: {
    groupId?: string
    open: boolean
    onClose: () => void
}) => {
    const group = useStageSelector<Group | undefined>(
        (state) => groupId && state.groups.byId[groupId]
    )
    const connection = useConnection()
    const removeStage = useCallback(() => {
        if (connection) {
            connection.emit(
                ClientDeviceEvents.RemoveGroup,
                groupId as ClientDevicePayloads.RemoveGroup
            )
        }
        onClose()
    }, [groupId, connection])
    if (group) {
        return (
            <Modal open={open} onClose={onClose} size="small">
                <ModalHeader>
                    <h4>Gruppe {group.name || group._id} wirklich löschen?</h4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Gruppen und deren Teilnehmer werden unwiderruflich gelöscht und sind nicht
                    mehr verfügbar!
                </Paragraph>
                <ModalFooter>
                    <ModalButton kind="tertiary" onClick={onClose}>
                        Nein
                    </ModalButton>
                    <ModalButton kind="danger" onClick={removeStage}>
                        Ja, Gruppe wirklich löschen
                    </ModalButton>
                </ModalFooter>
            </Modal>
        )
    }
    return null
}
RemoveGroupModal.defaultProps = {
    groupId: undefined,
}
export default RemoveGroupModal

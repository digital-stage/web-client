import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import React  from 'react'
import { NotificationItem } from 'ui/NotificationItem'
import { Paragraph } from 'ui/Paragraph'

const RemoveGroupModal = ({
    groupId,
    open,
    onClose,
}: {
    groupId?: string
    open: boolean
    onClose: () => void
}) => {
    const emit = useEmit()
    const name = useStageSelector((state) =>
        groupId ? state.groups.byId[groupId].name : undefined
    )
    const [error, setError] = React.useState<string>()
    const [isDeleting, setDeleting] = React.useState<boolean>(false)
    const removeStage = React.useCallback(() => {
        if (emit) {
            setDeleting(true)
            emit(
                ClientDeviceEvents.RemoveGroup,
                groupId as ClientDevicePayloads.RemoveGroup,
                (err: string | null) => {
                    if (err) {
                        setError(err)
                    } else {
                        onClose()
                    }
                    setDeleting(false)
                }
            )
        }
    }, [emit, onClose, groupId])
    if (groupId) {
        return (
            <Modal open={open} onClose={onClose} size="small">
                <ModalHeader>
                    <h4>Gruppe {name || groupId} wirklich löschen?</h4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Gruppen und deren Teilnehmer werden unwiderruflich gelöscht und sind nicht
                    mehr verfügbar!
                </Paragraph>
                {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
                <ModalFooter>
                    <ModalButton onClick={onClose}>Nein</ModalButton>
                    <ModalButton disabled={isDeleting} className="danger" onClick={removeStage}>
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
export { RemoveGroupModal }

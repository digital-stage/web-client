import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads, Group } from '@digitalstage/api-types'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import React, { useState } from 'react'
import { useCallback } from 'react'
import Notificaton from '../../../ui/Notification'
import Paragraph from '../../../ui/Paragraph'

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
    const group = useStageSelector<Group | undefined>((state) =>
        groupId ? state.groups.byId[groupId] : undefined
    )
    const [error, setError] = useState<string>()
    const [isDeleting, setDeleting] = useState<boolean>(false)
    const removeStage = useCallback(() => {
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
                {error ? <Notificaton kind="error">{error}</Notificaton> : null}
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
export default RemoveGroupModal

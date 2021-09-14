import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import React from 'react'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { NotificationItem } from 'ui/NotificationItem'
import { Paragraph } from 'ui/Paragraph'

const RemoveStageModal = ({
    stageId,
    open,
    onClose,
    onDelete,
}: {
    stageId?: string
    open: boolean
    onDelete?: () => void
    onClose: () => void
}) => {
    const emit = useEmit()
    const stageName = useStageSelector((state) =>
        stageId ? state.stages.byId[stageId]?.name : undefined
    )
    const [isDeleting, setDeleting] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string>()

   React.useEffect(() => {
        setError(undefined)
    }, [stageId])

    const removeStage = React.useCallback(() => {
        if (emit) {
            setDeleting(true)
            emit(
                ClientDeviceEvents.RemoveStage,
                stageId as ClientDevicePayloads.RemoveStage,
                (err: string | null) => {
                    if (err) {
                        setError(err)
                    } else {
                        onDelete()
                        onClose()
                    }
                    setDeleting(false)
                }
            )
        }
    }, [emit, onClose, onDelete, stageId])
    if (stageId) {
        return (
            <Modal open={open} onClose={onClose} size="small">
                <ModalHeader>
                    <h4>Bühne {stageName || stageId} wirklich löschen?</h4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Bühne und alle Gruppen sowie Teilnehmer werden unwiderruflich gelöscht und
                    sind nicht mehr verfügbar!
                </Paragraph>
                {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
                <ModalFooter>
                    <ModalButton onClick={onClose}>Nein</ModalButton>
                    <ModalButton disabled={isDeleting} className="danger" onClick={removeStage}>
                        Ja, Bühne wirklich löschen
                    </ModalButton>
                </ModalFooter>
            </Modal>
        )
    }
    return null
}
export { RemoveStageModal }

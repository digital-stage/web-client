import {useEmit, useStageSelector} from '@digitalstage/api-client-react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import React from 'react'
import {Modal, ModalButton, ModalFooter, ModalHeader} from 'ui/Modal'
import {NotificationItem} from 'ui/NotificationItem'
import {Paragraph} from 'ui/Paragraph'

const LeaveStageForGoodModal = ({
                                  stageId,
                                  open,
                                  onClose,
                                  onLeave
                                }: {
  stageId?: string
  open: boolean
  onLeave: () => void
  onClose: () => void
}) => {
  const emit = useEmit()
  const stageName = useStageSelector((state) =>
    stageId ? state.stages.byId[stageId]?.name : undefined
  )
  const [isLeaving, setLeaving] = React.useState<boolean>(false)
  const [error, setError] = React.useState<string>()

  React.useEffect(() => {
    setError(undefined)
  }, [stageId])

  const leaveStageForGood = React.useCallback(() => {
    if (emit) {
      setLeaving(true)
      emit(
        ClientDeviceEvents.LeaveStageForGood,
        stageId as ClientDevicePayloads.LeaveStageForGood,
        (err: string | null) => {
          if (err) {
            setError(err)
          } else {
            onLeave()
            onClose()
          }
          setLeaving(false)
        }
      )
    }
  }, [emit, onClose, stageId, onLeave])
  if (stageId) {
    return (
      <Modal open={open} onClose={onClose} size="small">
        <ModalHeader>
          <h4>Bühne {stageName || stageId} wirklich endgültig verlassen?</h4>
        </ModalHeader>
        <Paragraph kind="micro">
          Die Bühne bleibt bestehen, jedoch bist Du kein Teil mehr davon. Du kannst nur
          mit einer erneuten Einladung beitreten.
        </Paragraph>
        {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
        <ModalFooter>
          <ModalButton onClick={onClose}>Nein</ModalButton>
          <ModalButton
            disabled={isLeaving}
            className="danger"
            onClick={leaveStageForGood}
          >
            Ja, Bühne für endgültig verlassen
          </ModalButton>
        </ModalFooter>
      </Modal>
    )
  }
  return null
}
export {LeaveStageForGoodModal}

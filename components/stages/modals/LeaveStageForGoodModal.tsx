/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
          <ModalButton autoFocus={true} onClick={onClose}>Nein</ModalButton>
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

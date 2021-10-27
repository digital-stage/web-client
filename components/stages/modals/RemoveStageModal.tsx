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

import {useEmit, useTrackedSelector} from '@digitalstage/api-client-react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import React from 'react'
import {Modal, ModalButton, ModalFooter, ModalHeader} from 'ui/Modal'
import {NotificationItem} from 'ui/NotificationItem'
import {Paragraph} from 'ui/Paragraph'
import {Heading4} from "../../../ui/Heading";

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
}) : JSX.Element | null => {
    const emit = useEmit()
    const state = useTrackedSelector()
    const stageName = stageId ? state.stages.byId[stageId]?.name : undefined
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
                        if (onDelete)
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
                    <Heading4>Bühne {stageName || stageId} wirklich löschen?</Heading4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Bühne und alle Gruppen sowie Teilnehmer werden unwiderruflich gelöscht und
                    sind nicht mehr verfügbar!
                </Paragraph>
                {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
                <ModalFooter>
                    <ModalButton autoFocus onClick={onClose}>Nein</ModalButton>
                    <ModalButton disabled={isDeleting} className="danger" onClick={removeStage}>
                        Ja, Bühne wirklich löschen
                    </ModalButton>
                </ModalFooter>
            </Modal>
        )
    }
    return null
}
export {RemoveStageModal}

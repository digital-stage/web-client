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

import {useEmit, useTrackedSelector} from '../../../client'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import React  from 'react'
import { NotificationItem } from 'ui/NotificationItem'
import { Paragraph } from 'ui/Paragraph'
import { Heading4 } from 'ui/Heading'

const RemoveGroupModal = ({
    groupId,
    open,
    onClose,
}: {
    groupId?: string
    open: boolean
    onClose: () => void
}): JSX.Element | null => {
    const emit = useEmit()
    const state = useTrackedSelector()
    const name = groupId ? state.groups.byId[groupId]?.name : undefined
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
                    <Heading4>Gruppe {name || groupId} wirklich löschen?</Heading4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Die Gruppen und deren Teilnehmer werden unwiderruflich gelöscht und sind nicht
                    mehr verfügbar!
                </Paragraph>
                {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
                <ModalFooter>
                    <ModalButton onClick={onClose} autoFocus>Nein</ModalButton>
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

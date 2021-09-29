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

import React from 'react'
import {Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useEmit } from '@digitalstage/api-client-react'
import { Paragraph } from 'ui/Paragraph'
import { NotificationItem } from 'ui/NotificationItem'

const DeleteModal = ({ deviceId, onClose }: { deviceId: string; onClose: () => void }) => {
    const emit = useEmit()
    const [error, setError] = React.useState<string>()
    const deleteDevice = React.useCallback(() => {
        setError(undefined)
        emit(
            ClientDeviceEvents.RemoveDevice,
            deviceId as ClientDevicePayloads.RemoveDevice,
            (err: string | null) => {
                if (err) {
                    setError(err)
                }
                onClose()
            }
        )
    }, [deviceId, emit, onClose])
    return (
        <Modal size="small" open={!!deviceId} onClose={onClose}>
            <ModalHeader>Gerät löschen</ModalHeader>
            <Paragraph kind="micro">
                Das inaktive Gerät wird gelöscht. Du kannst es dann wieder erneut anmelden - jedoch
                verlierst Du alle Einstellungen, die das Gerät betreffen.
            </Paragraph>
            {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
            <ModalFooter>
                <ModalButton autoFocus={true} onClick={onClose}>Abbrechen</ModalButton>
                <ModalButton className="danger" onClick={deleteDevice}>Löschen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export {DeleteModal}

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
import { NotificationItem } from 'ui/NotificationItem'
import { Paragraph } from 'ui/Paragraph'
import dynamic from 'next/dynamic'
import { requestJoin, useEmit } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useDispatch } from 'react-redux'

const ReactCodeInput = dynamic(import('react-code-input'))

const EnterInviteCodeModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
    const [working, setWorking] = React.useState<boolean>(false)
    const [error, setError] = React.useState<string>()
    const [code, setCode] = React.useState<string>()
    const emit = useEmit()
    const dispatch = useDispatch()

   React.useEffect(() => {
        if (emit && dispatch && code && code?.length === 4) {
            setWorking(true)
            emit(
                ClientDeviceEvents.DecodeInviteCode,
                code as ClientDevicePayloads.DecodeInviteCode,
                (
                    error: string | null,
                    result?: { stageId: string; groupId: string; code: string }
                ) => {
                    if (result) {
                        dispatch(
                            requestJoin({
                                stageId: result.stageId,
                                groupId: result.groupId,
                            })
                        )
                    } else {
                        setError('Ungültiger Code')
                    }
                    setWorking(false)
                }
            )
        }
    }, [code, emit, dispatch])

   React.useEffect(() => {
        if (code?.length < 4) setError(undefined)
    }, [code?.length])

    return (
        <Modal open={open} onClose={onClose} className="enterInviteCodeModal" size="small">
            <ModalHeader>
                <h4>Einladungscode eingeben</h4>
            </ModalHeader>
            <Paragraph kind="micro" className="center">
                <ReactCodeInput
                    disabled={working}
                    name="Code"
                    inputMode="latin"
                    type="text"
                    fields={4}
                    onChange={(c) => {
                        setCode(c)
                    }}
                />
            </Paragraph>
            {error ? <NotificationItem kind="error">{error}</NotificationItem> : null}
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export { EnterInviteCodeModal }

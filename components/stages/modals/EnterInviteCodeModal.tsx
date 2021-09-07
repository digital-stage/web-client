import React, { useEffect, useState } from 'react'
import {Modal, ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import { Notification } from 'ui/Notification'
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
            {error ? <Notification kind="error">{error}</Notification> : null}
            <ModalFooter>
                <ModalButton onClick={onClose}>Abbrechen</ModalButton>
            </ModalFooter>
        </Modal>
    )
}
export { EnterInviteCodeModal }

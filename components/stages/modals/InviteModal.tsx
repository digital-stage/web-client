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
import { useEmit } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { NotificationItem } from 'ui/NotificationItem'
import  { Modal,ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import {TextInput} from 'ui/TextInput'
import { BiReset } from 'react-icons/bi'
import { Paragraph } from 'ui/Paragraph'
import {Heading3, Heading4} from 'ui/Heading'

const InviteModal = ({
    open,
    onClose,
    stageId,
    groupId,
}: {
    open: boolean
    onClose: () => void
    stageId: string
    groupId: string
}) => {
    const emit = useEmit()
    const [resetOpen, setResetOpen] = React.useState<boolean>(false)
    const [code, setCode] = React.useState<string>()
    const [info, setInfo] = React.useState<string>()
    const [error, setError] = React.useState<string>()

    const resetCode = React.useCallback((): Promise<string> => {
        if (emit && stageId && groupId) {
            return new Promise<string>((resolve, reject) =>
                emit(
                    ClientDeviceEvents.RevokeInviteCode,
                    { stageId, groupId } as ClientDevicePayloads.RevokeInviteCode,
                    (err: string | null, code_?: string) => {
                        if (err) return reject(err)
                        if (code_) return resolve(code_)
                        reject('No code returned')
                    }
                )
            )
        }
        throw new Error(`Internal error: not ready: ${stageId} and ${groupId}`)
    }, [emit, stageId, groupId])

   React.useEffect(() => {
        if (emit && stageId && groupId) {
            emit(
                ClientDeviceEvents.EncodeInviteCode,
                { stageId, groupId } as ClientDevicePayloads.EncodeInviteCode,
                (err: string | null, code_?: string) => {
                    if (err) {
                        return setError(err)
                    }
                    setError(undefined)
                    setCode(code_)
                    return code_
                }
            )
        }
    }, [emit, stageId, groupId])

   React.useEffect(() => {
        if (open) {
            return () => {
                setInfo(undefined)
                setError(undefined)
                setCode(undefined)
            }
        }
        return undefined
    }, [open])

    return (
        <Modal size="small" open={open} onClose={onClose} className="inviteModal">
            <ModalHeader>
                <Heading3>Einladen</Heading3>
            </ModalHeader>
            <div className="inviteCodeWrapper">
                {code ? (
                    <TextInput type="text" readOnly value={code} label="Einladungscode" light />
                ) : (
                    '...'
                )}
                <button className="round" onClick={() => setResetOpen(true)}>
                    <BiReset />
                </button>
            </div>
            <div className="inviteModalActions">
                {code ? (
                    <div className="inviteModalCopy">
                        <button
                            onClick={() => {
                                navigator.clipboard
                                    .writeText(code)
                                    .then(() => setInfo('Code in die Zwischenablage kopiert!'))
                                    .catch(() =>
                                        setError(
                                            'Konnte Code leider nicht in die Zwischenlage einfügen'
                                        )
                                    )
                            }}
                            autoFocus
                        >
                            Code kopieren
                        </button>
                    </div>
                ) : null}
                <button
                    onClick={() => {
                        const port: string = window.location.port ? `:${window.location.port}` : ''
                        const generatedLink = `${window.location.protocol}//${window.location.hostname}${port}/join/${code}`
                        navigator.clipboard
                            .writeText(generatedLink)
                            .then(() => setInfo('Link in die Zwischenablage kopiert!'))
                            .catch(() =>
                                setError(
                                    'Konnte den Link leider nicht in die Zwischenlage einfügen'
                                )
                            )
                    }}
                >
                    Link kopieren
                </button>
            </div>
            {info && <NotificationItem kind="success">{info}</NotificationItem>}
            {error && <NotificationItem kind="error">{error}</NotificationItem>}
            <ModalFooter>
                <ModalButton onClick={onClose}>Schließen</ModalButton>
            </ModalFooter>

            <Modal size="small" open={resetOpen} onClose={() => setResetOpen(false)}>
                <ModalHeader>
                    <Heading4>Code neu generieren</Heading4>
                </ModalHeader>
                <Paragraph kind="micro">
                    Möchtest Du den Code wirklich neu generieren?
                    Einladungen mit dem alten Code verlieren damit ihre Gültigkeit.
                    Teilnehmer, welcher bereits einer Einladung gefolgt sind, bleiben jedoch weiterhin auf der Bühne.
                </Paragraph>
                <ModalFooter>
                    <ModalButton onClick={() => setResetOpen(false)}>Abbrechen</ModalButton>
                    <ModalButton
                        className="danger"
                        onClick={() =>
                            resetCode()
                                .then((code_) => setCode(code_))
                                .then(() => setError(undefined))
                                .then(() => setResetOpen(false))
                                .catch((err) => setError(err))
                        }
                    >
                        Code neu generieren
                    </ModalButton>
                </ModalFooter>
            </Modal>
        </Modal>
    )
}
export { InviteModal }

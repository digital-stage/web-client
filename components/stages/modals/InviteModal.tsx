import React, { useCallback, useEffect, useState } from 'react'
import { useConnection } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import Notification from '../../../ui/Notification'
import Modal, { ModalButton, ModalFooter, ModalHeader } from 'ui/Modal'
import TextInput from 'ui/TextInput'
import { BiReset } from 'ui/Icons'

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
    const connection = useConnection()
    const [resetOpen, setResetOpen] = useState<boolean>(false)
    const [code, setCode] = useState<string>()
    const [info, setInfo] = useState<string>()
    const [error, setError] = useState<string>()

    const resetCode = useCallback((): Promise<string> => {
        if (connection && stageId && groupId) {
            return new Promise<string>((resolve, reject) =>
                connection.emit(
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
    }, [connection, stageId, groupId])

    useEffect(() => {
        if (connection && stageId && groupId) {
            connection.emit(
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
    }, [connection, stageId, groupId])

    useEffect(() => {
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
        <Modal size="small" open={open} onClose={onClose}>
            <ModalHeader>
                <h3>Einladen</h3>
            </ModalHeader>
            <div className="flex align-center justify-center">
                {code ? (
                    <TextInput type="text" readOnly value={code} label="Einladungscode" light />
                ) : (
                    '...'
                )}
                <button className="round" onClick={() => setResetOpen(true)}>
                    <BiReset />
                </button>
            </div>
            <div className="flex align-center justify-center pb-2">
                {code ? (
                    <div className="pr-2">
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
            {info && <Notification kind="success">{info}</Notification>}
            {error && <Notification kind="error">{error}</Notification>}
            <ModalFooter>
                <ModalButton onClick={onClose}>Schließen</ModalButton>
            </ModalFooter>

            <Modal size="small" open={resetOpen} onClose={() => setResetOpen(false)}>
                REALY?
                <ModalFooter>
                    <ModalButton onClick={() => setResetOpen(false)}>Abbrechen</ModalButton>
                    <ModalButton
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
export default InviteModal

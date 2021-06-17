import React, { useState } from 'react'
import { useAuth, useConnection, User, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import Block from '../../componentsOld/ui/Block'
import LiveInput from '../../ui/LiveInput'
import Button from '../../ui/Button'
import Notification from '../../ui/Notification'
import styles from './ProfileEditor.module.css'

const ProfileEditor = () => {
    const { requestPasswordReset, user: authUser } = useAuth()
    const localUser = useStageSelector<User>((state) => state.globals.localUser)
    const connection = useConnection()
    const [message, setMessage] = useState<string>()
    const [error, setError] = useState<string>()

    return (
        <div className={styles.wrapper}>
            <LiveInput
                label="Benutername"
                value={localUser?.name}
                onChange={(name) =>
                    connection.emit(ClientDeviceEvents.ChangeUser, {
                        name,
                    } as ClientDevicePayloads.ChangeUser)
                }
            />
            <Block>Email: {authUser?.email}</Block>
            <Block vertical padding={4}>
                <Button
                    onClick={() =>
                        requestPasswordReset(authUser?.email)
                            .then(() =>
                                setMessage(
                                    'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!'
                                )
                            )
                            .catch((err) => setError(err))
                    }
                >
                    Passwort ändern
                </Button>
            </Block>
            {message && <Notification kind="success">{message}</Notification>}
            {error && <Notification kind="error">{error}</Notification>}
        </div>
    )
}
export default ProfileEditor

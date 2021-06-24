import React, { useState } from 'react'
import { useAuth, useConnection, User, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import LiveInput from '../../fastui/components/interaction/LiveInput'
import Button from '../../fastui/components/interaction/Button'
import Notification from '../../fastui/components/Notification'
import styles from './ProfileEditor.module.css'

const ProfileEditor = () => {
    const { requestPasswordReset, user: authUser } = useAuth()
    const localUser = useStageSelector<User | undefined>((state) =>
        state.globals.localUserId ? state.users.byId[state.globals.localUserId] : undefined
    )
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
            <div>Email: {authUser?.email}</div>
            <div>
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
            </div>
            {message && <Notification kind="success">{message}</Notification>}
            {error && <Notification kind="error">{error}</Notification>}
        </div>
    )
}
export default ProfileEditor

import React, { useState } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads, User } from '@digitalstage/api-types'
import styles from './ProfileEditor.module.scss'
import Notification from '../../ui/Notification'
import LiveInput from '../../ui/LiveInput'
import {
    requestPasswordReset,
    useConnection,
    useStageSelector,
} from '@digitalstage/api-client-react'

const ProfileEditor = () => {
    const { emit } = useConnection()
    const authUser = useStageSelector((state) => state.auth.user)
    const localUser = useStageSelector<User | undefined>((state) =>
        state.globals.localUserId ? state.users.byId[state.globals.localUserId] : undefined
    )
    const [message, setMessage] = useState<string>()
    const [error, setError] = useState<string>()

    return (
        <>
            <LiveInput
                label="Benutername"
                value={localUser?.name}
                onChange={(name) =>
                    emit(ClientDeviceEvents.ChangeUser, {
                        name,
                    } as ClientDevicePayloads.ChangeUser)
                }
            />
            <div className={styles.settings}>
                <div className={styles.setting}>Email: {authUser?.email}</div>
                <div className={`${styles.setting} ${styles.centered}`}>
                    <button
                        onClick={() => {
                            if (authUser)
                                requestPasswordReset(authUser.email)
                                    .then(() =>
                                        setMessage(
                                            'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!'
                                        )
                                    )
                                    .catch((err) => setError(err))
                        }}
                    >
                        Passwort ändern
                    </button>
                </div>
                {message && <Notification kind="success">{message}</Notification>}
                {error && <Notification kind="error">{error}</Notification>}
            </div>
        </>
    )
}
export default ProfileEditor

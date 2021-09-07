import React, { useState } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads, User } from '@digitalstage/api-types'
import { Notification } from 'ui/Notification'
import { LiveInput } from 'ui/LiveInput'
import { requestPasswordReset, useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { Paragraph } from 'ui/Paragraph'
import { OptionsList, OptionsListItem  } from 'ui/OptionsList'

const ProfileEditor = () => {
    const emit = useEmit()
    const authUser = useStageSelector((state) => state.auth.user)
    const localUser = useStageSelector<User | undefined>((state) =>
        state.globals.localUserId ? state.users.byId[state.globals.localUserId] : undefined
    )
    const [message, setMessage] = React.useState<string>()
    const [error, setError] = React.useState<string>()

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
            <OptionsList>
                <OptionsListItem as={<Paragraph />}>Email: {authUser?.email}</OptionsListItem>
                <OptionsListItem>
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
                </OptionsListItem>
                {message && <Notification kind="success">{message}</Notification>}
                {error && <Notification kind="error">{error}</Notification>}
            </OptionsList>
        </>
    )
}
export {ProfileEditor}

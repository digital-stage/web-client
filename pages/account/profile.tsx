import React, { useState } from 'react'
import { useAuth, useConnection, User, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import Panel from '../../components/ui/Panel'
import Container from '../../components/ui/Container'
import Block from '../../components/ui/Block'
import LiveInput from '../../components/ui/LiveInput'
import LoadingOverlay from '../../components/LoadingOverlay'
import Button from '../../ui/Button'
import Notification from '../../components/ui/Notification'

const Profile = () => {
    const { requestPasswordReset, loading, user: authUser } = useAuth()
    const localUser = useStageSelector<User>((state) => state.globals.localUser)
    const connection = useConnection()
    const [message, setMessage] = useState<string>()
    const [error, setError] = useState<string>()

    if (loading) return <LoadingOverlay>Lade Nutzerdaten...</LoadingOverlay>

    return (
        <Container>
            <Block paddingTop={4} paddingBottom={4}>
                <h2>Mein Benutzerprofil</h2>
                <Panel>
                    <Block vertical padding={4}>
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
                                        .then(() => {
                                            setMessage(
                                                'Wir haben Dir eine E-Mail mit einem Link zum Zurücksetzen Deines Passwortes geschickt!'
                                            )
                                        })
                                        .catch((err) => setError(err))
                                }
                            >
                                Passwort ändern
                            </Button>
                        </Block>
                        {message && <Notification type="success">{message}</Notification>}
                        {error && <Notification type="error">{error}</Notification>}
                    </Block>
                </Panel>
            </Block>
        </Container>
    )
}
export default Profile

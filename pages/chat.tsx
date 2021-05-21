import { RemoteUsers, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ChatMessage, ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import Container from '../components/ui/Container'
import Panel from '../components/ui/Panel'
import Input from '../components/ui/Input'
import Button from '../components/ui/Button'
import Notification from '../components/ui/Notification'
import styles from '../styles/Chat.module.css'

const Chat = () => {
    const [message, setMessage] = useState<string>()
    const [error, setError] = useState<string>()
    const connection = useConnection()
    const messages = useStageSelector<ChatMessage[]>((state) => state.chatMessages)
    const users = useStageSelector<RemoteUsers>((state) => state.remoteUsers)
    return (
        <Container>
            <Panel>
                <div className={styles.wrapper}>
                    <div className={styles.messages}>
                        {messages.map((msg) => {
                            let dateStr
                            const min = (Date.now() - msg.time) / 60000
                            if (min < 1) {
                                dateStr = `Vor ${Math.round(60 * min)} Sekunden`
                            } else if (min > 60) {
                                dateStr = `Vor ${Math.round((min / 60) * 10) / 10} Stunde*n'`
                            } else {
                                dateStr = `Vor ${Math.round(min)} Minuten`
                            }
                            return (
                                <div>
                                    <div>{users.byId[msg.userId]?.name}</div>
                                    <div>{dateStr}</div>
                                    <div>{msg.message}</div>
                                </div>
                            )
                        })}
                    </div>
                    {error && <Notification type="error">{error}</Notification>}
                    <div className={styles.sendField}>
                        <Input
                            value={message}
                            label="Nachricht"
                            onChange={(e) => setMessage(e.currentTarget.value)}
                        />
                        <Button
                            onClick={() => {
                                connection.emit(
                                    ClientDeviceEvents.SendChatMessage,
                                    message as ClientDevicePayloads.SendChatMessage,
                                    (err: string | null) => (err ? setError(err) : setMessage(''))
                                )
                            }}
                        >
                            <AiOutlineSend />
                        </Button>
                    </div>
                </div>
            </Panel>
        </Container>
    )
}
export default Chat

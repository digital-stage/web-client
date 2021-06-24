import { Users, useAuth, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ChatMessage, ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AiOutlineSend } from 'react-icons/ai'
import { useRouter } from 'next/router'
import Button from '../fastui/components/interaction/Button'
import Notification from '../fastui/components/Notification'
import styles from '../styles/Chat.module.css'
import useForceUpdate from '../lib/useForceUpdate'
import DefaultContainer from '../fastui/components/container/DefaultContainer'
import FixedPanel from '../fastui/components/panels/FixedPanel'
import { useNotification } from '../components/NotificationCenter'

const convertTime = (time: number): string => {
    const min = (Date.now() - time) / 60000
    if (min < 1) {
        return `Vor ${Math.round(60 * min)} Sekunden`
    }
    if (min > 60) {
        return `Vor ${Math.round((min / 60) * 10) / 10} Stunde*n'`
    }
    return `Vor ${Math.round(min)} Minuten`
}

const Chat = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])
    const [error, setError] = useState<string>('Bla')
    const connection = useConnection()
    const messages = useStageSelector<ChatMessage[]>((state) => state.chatMessages)
    const users = useStageSelector<Users>((state) => state.users)
    const localUserId = useStageSelector<string | undefined>((state) => state.globals.localUserId)
    const messageRef = useRef<HTMLInputElement>()
    const messagesEndRef = useRef<HTMLDivElement>()
    const forceUpdate = useForceUpdate()
    const { addNotification } = useNotification()

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate()
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    })

    const onSendClicked = useCallback(() => {
        if (messageRef.current && connection) {
            const msg = messageRef.current.value
            if (msg.length > 0) {
                connection.emit(
                    ClientDeviceEvents.SendChatMessage,
                    msg as ClientDevicePayloads.SendChatMessage,
                    (err: string | null) => err && setError(err)
                )
                messageRef.current.value = ''
            }
        }
    }, [messageRef, connection])

    useEffect(() => {
        if (messages.length > 0) {
            addNotification(
                'info',
                <div>
                    {users.byId[messages[messages.length - 1].userId].name}:&nbsp;
                    {messages[messages.length - 1].message}
                </div>
            )
        }
    }, [messages])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messagesEndRef, messages])

    return (
        <DefaultContainer>
            <FixedPanel>
                <h4 className={styles.title}>Chat</h4>
                <div className={styles.messages}>
                    {messages.map((msg, index) => {
                        return (
                            <div
                                /* eslint-disable-next-line react/no-array-index-key */
                                key={`${msg.time}${index}`}
                                className={`${styles.messageWrapper} ${
                                    localUserId === msg.userId && styles.self
                                }`}
                            >
                                {msg.userId !== localUserId && (
                                    <h5 className={styles.messageName}>
                                        {users.byId[msg.userId]?.name}
                                    </h5>
                                )}
                                <div className={styles.message}>{msg.message}</div>
                                <div className={styles.messageTime}>{convertTime(msg.time)}</div>
                            </div>
                        )
                    })}
                    <div ref={messagesEndRef} />
                </div>
                {error && (
                    <Notification className={styles.notification} kind="error">
                        {error}
                    </Notification>
                )}
                <form
                    className={styles.messageForm}
                    onSubmit={(e) => {
                        e.preventDefault()
                        onSendClicked()
                    }}
                >
                    <input ref={messageRef} type="text" className={styles.input} />
                    <Button
                        className={styles.mobileButton}
                        type="submit"
                        round
                        size="small"
                        onClick={onSendClicked}
                    >
                        <AiOutlineSend />
                    </Button>
                    <Button
                        className={styles.button}
                        type="submit"
                        size="small"
                        onClick={onSendClicked}
                    >
                        Nachricht senden
                    </Button>
                </form>
            </FixedPanel>
        </DefaultContainer>
    )
}
export default Chat

import { ChatMessage, ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './Chat.module.css'
import React from 'react'
import Link from 'next/link'
import { useConnection, useReport, Users, useStageSelector } from '@digitalstage/api-client-react'
import useForceUpdate from './useForceUpdate'
import Notification from '../../../ui/Notification'
import Panel from '../../../ui/Panel'
import { AiOutlineSend } from 'react-icons/ai'

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

const MessagePane = ({
    messages,
    hasErrors,
    localUserId,
    users,
}: {
    messages: ChatMessage[]
    hasErrors: boolean
    localUserId: string
    users: Users
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const forceUpdate = useForceUpdate()

    useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate()
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [forceUpdate])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messagesEndRef, messages])

    return (
        <div className={`${styles.messages} ${hasErrors ? styles.withErrors : ''}`}>
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
                            <h5 className={styles.messageName}>{users.byId[msg.userId]?.name}</h5>
                        )}
                        <div className={styles.message}>{msg.message}</div>
                        <div className={styles.messageTime}>{convertTime(msg.time)}</div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}

const ChatPanel = () => {
    const [error, setError] = useState<string>()
    const messages = useStageSelector<ChatMessage[]>((state) => state.chatMessages)
    const messageRef = useRef<HTMLInputElement>(null)
    const { emit } = useConnection()
    const { report } = useReport()
    const localUserId = useStageSelector<string | undefined>((state) => state.globals.localUserId)
    const users = useStageSelector<Users>((state) => state.users)

    const onSendClicked = useCallback(() => {
        if (messageRef.current && emit) {
            const msg = messageRef.current.value
            if (msg.length > 0) {
                emit(
                    ClientDeviceEvents.SendChatMessage,
                    msg as ClientDevicePayloads.SendChatMessage,
                    (err: string | null) => err && setError(err)
                )
                messageRef.current.value = ''
            }
        }
    }, [messageRef, emit])

    useEffect(() => {
        if (messages.length > 0) {
            // Report last message
            if (messages[messages.length - 1].userId !== localUserId) {
                report(
                    'info',
                    <div>
                        {users.byId[messages[messages.length - 1].userId].name}:&nbsp;
                        <Link href="/chat">{messages[messages.length - 1].message}</Link>
                    </div>
                )
            }
        }
    }, [report, messages, localUserId, users.byId])

    return (
        <Panel className={styles.panel}>
            <MessagePane
                users={users}
                hasErrors={!!error}
                messages={messages}
                localUserId={localUserId}
            />
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
                <input autoFocus ref={messageRef} type="text" className={styles.input} />
                <button
                    className={`${styles.mobileButton} round small`}
                    type="submit"
                    onClick={onSendClicked}
                >
                    <AiOutlineSend />
                </button>
                <button className={`${styles.button} small`} type="submit" onClick={onSendClicked}>
                    Nachricht senden
                </button>
            </form>
        </Panel>
    )
}
export default ChatPanel

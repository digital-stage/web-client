import React, { useCallback, useEffect, useRef } from 'react'
import { useIntl } from 'react-intl'
import { BiSend } from 'react-icons/bi'
import { RemoteUsers, useConnection, useStageSelector } from '@digitalstage/api-client-react'
import {
    ChatMessage,
    ClientDeviceEvents,
    ClientDevicePayloads,
    User,
} from '@digitalstage/api-types'
import styles from './StageChat.module.css'
import Input from '../../ui/form/Input'
import PrimaryButton from '../../ui/button/PrimaryButton'

const StageChat = (): JSX.Element => {
    const messages = useStageSelector<ChatMessage[]>((state) => state.chatMessages)
    const users = useStageSelector<RemoteUsers>((state) => state.remoteUsers)
    const currentUser = useStageSelector<User | undefined>((state) => state.globals.localUser)
    const connection = useConnection()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })
    const messageRef = useRef<HTMLInputElement>()
    const messagesEndRef = useRef<HTMLDivElement>()

    const onSendClicked = useCallback(() => {
        if (messageRef.current && connection) {
            const msg = messageRef.current.value
            if (msg.length > 0) {
                connection.emit(
                    ClientDeviceEvents.SendChatMessage,
                    msg as ClientDevicePayloads.SendChatMessage
                )
                messageRef.current.value = ''
            }
        }
    }, [messageRef, connection])

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messagesEndRef, messages])

    return (
        <div className={styles.wrapper}>
            <div className={styles.messages}>
                {messages.map((message) => (
                    <div
                        className={`${styles.message} ${
                            currentUser?._id === message.userId && styles.self
                        }`}
                        key={message.time}
                    >
                        {message.userId !== currentUser?._id && (
                            <h5>{users[message.userId].name}</h5>
                        )}
                        <p>{message.message}</p>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form
                onSubmit={(e) => {
                    e.preventDefault()
                    onSendClicked()
                }}
                className={styles.form}
            >
                <Input ref={messageRef} label="Message" className={styles.input} type="text" />
                <PrimaryButton className={styles.button} type="submit">
                    {f('sendMessage')}
                </PrimaryButton>
                <div className={styles.mobileOnly}>
                    <PrimaryButton round type="submit">
                        <BiSend name={f('sendMessage')} />
                    </PrimaryButton>
                </div>
            </form>
        </div>
    )
}
export default StageChat

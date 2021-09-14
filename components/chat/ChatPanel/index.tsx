import { ChatMessage, ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useCallback, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useEmit, Users, useStageSelector } from '@digitalstage/api-client-react'
import {useForceUpdate} from './useForceUpdate'
import { Notification } from 'ui/NotificationItem'
import { Panel } from 'ui/Panel'
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
    const messagesEndRef = React.useRef<HTMLDivElement>(null)
    const forceUpdate = useForceUpdate()

   React.useEffect(() => {
        const interval = setInterval(() => {
            forceUpdate()
        }, 1000)
        return () => {
            clearInterval(interval)
        }
    }, [forceUpdate])

   React.useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messagesEndRef, messages])

    return (
        <div className={`chatMessages ${hasErrors ? 'chatMessagesWithError' : ''}`}>
            {messages.map((msg, index) => {
                return (
                    <div
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={`${msg.time}${index}`}
                        className={`chatMessageWrapper ${
                            localUserId === msg.userId && 'chatMessageWrapperSelf'
                        }`}
                    >
                        {msg.userId !== localUserId && (
                            <h5 className="chatMessageName">{users.byId[msg.userId]?.name}</h5>
                        )}
                        <div className="chatMessage">{msg.message}</div>
                        <div className="chatMessageTime">{convertTime(msg.time)}</div>
                    </div>
                )
            })}
            <div ref={messagesEndRef} />
        </div>
    )
}

const ChatPanel = () => {
    const [error, setError] = React.useState<string>()
    const messages = useStageSelector<ChatMessage[]>((state) => state.chatMessages)
    const messageRef = React.useRef<HTMLInputElement>(null)
    const emit = useEmit()
    const localUserId = useStageSelector<string | undefined>((state) => state.globals.localUserId)
    const users = useStageSelector<Users>((state) => state.users)

    const onSendClicked = React.useCallback(() => {
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

    return (
        <Panel className="chatLayout">
            <MessagePane
                users={users}
                hasErrors={!!error}
                messages={messages}
                localUserId={localUserId}
            />
            {error && (
                <Notification className="chatNotification" kind="error">
                    {error}
                </Notification>
            )}
            <form
                className="chatMessageForm"
                onSubmit={(e) => {
                    e.preventDefault()
                    onSendClicked()
                }}
            >
                <input autoFocus ref={messageRef} type="text" className="chatInput" />
                <button
                    className={`chatMobileSendButton round small`}
                    type="submit"
                    onClick={onSendClicked}
                >
                    <AiOutlineSend />
                </button>
                <button className={`chatSendButton small`} type="submit" onClick={onSendClicked}>
                    Nachricht senden
                </button>
            </form>
        </Panel>
    )
}
export {ChatPanel}

import { ChatMessage, ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import { useCallback, useEffect, useRef, useState } from 'react'
import React from 'react'
import { useEmit, Users, useStageSelector } from '@digitalstage/api-client-react'
import {useForceUpdate} from './useForceUpdate'
import { Notification } from 'ui/Notification'
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
        <div className={`messages ${hasErrors ? 'withErrors' : ''}`}>
            {messages.map((msg, index) => {
                return (
                    <div
                        /* eslint-disable-next-line react/no-array-index-key */
                        key={`${msg.time}${index}`}
                        className={`messageWrapper ${
                            localUserId === msg.userId && 'self'
                        }`}
                    >
                        {msg.userId !== localUserId && (
                            <h5 className="messageName">{users.byId[msg.userId]?.name}</h5>
                        )}
                        <div className="message">{msg.message}</div>
                        <div className="messageTime">{convertTime(msg.time)}</div>
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
    const emit = useEmit()
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

    return (
        <Panel className="chatLayout">
            <MessagePane
                users={users}
                hasErrors={!!error}
                messages={messages}
                localUserId={localUserId}
            />
            {error && (
                <Notification className="notification" kind="error">
                    {error}
                </Notification>
            )}
            <form
                className="messageForm"
                onSubmit={(e) => {
                    e.preventDefault()
                    onSendClicked()
                }}
            >
                <input autoFocus ref={messageRef} type="text" className="input" />
                <button
                    className={`mobileButton round small`}
                    type="submit"
                    onClick={onSendClicked}
                >
                    <AiOutlineSend />
                </button>
                <button className={`button small`} type="submit" onClick={onSendClicked}>
                    Nachricht senden
                </button>
            </form>
        </Panel>
    )
}
export {ChatPanel}

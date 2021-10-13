/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {ChatMessage, ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import React from 'react'
import {selectLocalUserId, useEmit, Users, useTrackedSelector} from '@digitalstage/api-client-react'
import {NotificationItem} from 'ui/NotificationItem'
import {Panel} from 'ui/Panel'
import {AiOutlineSend} from 'react-icons/ai'
import {useForceUpdate} from './useForceUpdate'
import {Heading5} from "../../../ui/Heading";

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
}): JSX.Element | null => {
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
      messagesEndRef.current.scrollIntoView({behavior: 'smooth'})
    }
  }, [messagesEndRef, messages])

  return (
    <div className={`chatMessages ${hasErrors ? 'chatMessagesWithError' : ''}`}>
      {messages.map((msg, index) => (
          <div
            /* eslint-disable-next-line react/no-array-index-key */
            key={`${msg.time}${index}`}
            className={`chatMessageWrapper ${
              localUserId === msg.userId && 'chatMessageWrapperSelf'
            }`}
          >
            {msg.userId !== localUserId && (
              <Heading5 className="chatMessageName">{users.byId[msg.userId]?.name}</Heading5>
            )}
            <div className="chatMessage">{msg.message}</div>
            <div className="chatMessageTime">{convertTime(msg.time)}</div>
          </div>
        ))}
      <div ref={messagesEndRef}/>
    </div>
  )
}

const ChatPanel = () => {
  const [error, setError] = React.useState<string>()
  const state = useTrackedSelector()
  const messages = state.chatMessages
  const messageRef = React.useRef<HTMLInputElement>(null)
  const emit = useEmit()
  const localUserId = selectLocalUserId(state)
  const users = state.users

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

  if (localUserId) {
    return (
      <Panel className="chatLayout">
        <MessagePane
          users={users}
          hasErrors={!!error}
          messages={messages}
          localUserId={localUserId}
        />
        {error && (
          <NotificationItem className="chatNotification" kind="error">
            {error}
          </NotificationItem>
        )}
        <form
          className="chatMessageForm"
          onSubmit={(e) => {
            e.preventDefault()
            onSendClicked()
          }}
        >
          <input autoFocus ref={messageRef} type="text" className="chatInput"/>
          <button
            className="chatMobileSendButton round small"
            type="submit"
            onClick={onSendClicked}
          >
            <AiOutlineSend/>
          </button>
          <button className="chatSendButton small" type="submit" onClick={onSendClicked}>
            Nachricht senden
          </button>
        </form>
      </Panel>
    )
  }

  return null
}
export {ChatPanel}

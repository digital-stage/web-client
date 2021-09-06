import React from 'react'
import {ChatPanel} from '../components/chat/ChatPanel'
import {Container} from '../ui/Container'

const Chat = () => {
    return (
        <Container size="small" flex>
            <ChatPanel />
        </Container>
    )
}
export default Chat

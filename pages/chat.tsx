import React from 'react'
import ChatPanel from '../components/chat/ChatPanel'
import Head from 'next/head'
import Container from '../ui/Container'

const Chat = () => {
    return (
        <>
            <Head>
                <title>Chat</title>
            </Head>
            <Container>
                <ChatPanel />
            </Container>
        </>
    )
}
export default Chat

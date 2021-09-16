import React from 'react'
import {ChatPanel} from '../components/chat/ChatPanel'
import {Container} from '../ui/Container'
import {Loading} from "../components/global/Loading";
import {useStageAvailable} from "../components/global/useStageAvailable";

const Chat = () => {
    const stageAvailable = useStageAvailable()

    if (stageAvailable) {
        return (
            <Container size="small" flex>
                <ChatPanel/>
            </Container>
        )
    }

    return <Loading />
}
export default Chat

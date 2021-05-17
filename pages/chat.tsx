import { useAuth } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'
import StageChat from '../components/chat/StageChat'

const Chat = () => {
    const { push } = useRouter()
    const { loading, user } = useAuth()

    useEffect(() => {
        if (!loading && !user && push) {
            push('/account/login')
        }
    }, [loading, user, push])

    return <StageChat />
}
export default Chat

import {
    addNotification,
    changeNotification,
    useStageSelector,
} from '@digitalstage/api-client-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { v4 as uuidv4 } from 'uuid'

const NotificationService = () => {
    const chatMessages = useStageSelector((state) => state.chatMessages)
    const dispatch = useDispatch()
    const [, setTimeouts] = useState<any[]>([])

    useEffect(() => {
        // Handle last message
        if (chatMessages.length > 0) {
            const chatMessage = chatMessages[chatMessages.length - 1]
            const id = uuidv4()
            dispatch(
                addNotification({
                    id,
                    date: new Date().getTime(),
                    kind: 'info',
                    message: (
                        <Link href="/chat">
                            <a>{chatMessage.message}</a>
                        </Link>
                    ),
                    permanent: false,
                    featured: true,
                })
            )
            const timeout = setTimeout(() => {
                dispatch(
                    changeNotification({
                        id,
                        featured: false,
                    })
                )
            }, 2000)
            setTimeouts((prev) => [...prev, timeout])
        }
    }, [chatMessages, dispatch])

    useEffect(() => {
        return () => {
            setTimeouts((prev) => {
                prev.forEach((timeout) => clearTimeout(timeout))
                return []
            })
        }
    }, [])

    return null
}
export default NotificationService

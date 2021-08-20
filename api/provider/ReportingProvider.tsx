import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
    useStageSelector,
    Notification,
    addNotification as addNotificationAction,
    changeNotification as changeNotificationAction,
    removeNotification as removeNotificationAction,
} from '@digitalstage/api-client-react'
import Link from 'next/link'
import debug from 'debug'
import { useDispatch } from 'react-redux'

const log = debug('NotificationProvider')

export interface ReportingContextT {
    addNotification: (notification: Omit<Notification, 'id'>) => string
    changeNotification: (id: string, update: Partial<Omit<Notification, 'id'>>) => void
    removeNotification: (id: string) => void
}

const throwAddProviderError = () => {
    throw new Error('Please wrap around your DOM tree with the NotificationProvider')
}

const ReportingContext = createContext<ReportingContextT>({
    addNotification: throwAddProviderError,
    changeNotification: throwAddProviderError,
    removeNotification: throwAddProviderError,
})

const ReportingProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch()
    const [, setTimeouts] = useState<any[]>([])

    // Clean up timeouts
    useEffect(() => {
        return () => {
            setTimeouts((prev) => {
                prev.forEach((timeout) => clearTimeout(timeout))
                return []
            })
        }
    }, [])

    const changeNotification = useCallback(
        (id: string, update: Partial<Omit<Notification, 'id'>>) => {
            dispatch(
                changeNotificationAction({
                    id,
                    ...update,
                })
            )
        },
        [dispatch]
    )

    const addNotification = useCallback(
        (notification: Omit<Notification, 'id'>) => {
            log('addNotification')
            const id = uuidv4()
            dispatch(
                addNotificationAction({
                    id,
                    ...notification,
                })
            )
            if (!notification.permanent) {
                const timeout = setTimeout(() => {
                    dispatch(
                        changeNotificationAction({
                            id,
                            featured: false,
                        })
                    )
                }, 3000)
                setTimeouts((prev) => [...prev, timeout])
            }
            return id
        },
        [dispatch]
    )

    const removeNotification = useCallback(
        (id: string) => dispatch(removeNotificationAction(id)),
        [dispatch]
    )

    // Handle chat messages
    const localStageMemberId = useStageSelector((state) => state.globals.stageMemberId)
    const chatMessages = useStageSelector((state) => state.chatMessages)
    useEffect(() => {
        if (chatMessages.length > 0) {
            // Always use only last chat message
            const chatMessage = chatMessages[chatMessages.length - 1]
            if (chatMessage.stageMemberId === localStageMemberId) {
                //TODO: omit
            }
            addNotification({
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
        }
    }, [addNotification, chatMessages, localStageMemberId])

    // Memorize published state
    const value = useMemo(() => {
        return {
            addNotification,
            changeNotification,
            removeNotification,
        }
    }, [addNotification, changeNotification, removeNotification])

    return <ReportingContext.Provider value={value}>{children}</ReportingContext.Provider>
}

export { ReportingContext }
export default ReportingProvider

import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import {
    Notification,
    addNotification as addNotificationAction,
    changeNotification as changeNotificationAction,
    removeNotification as removeNotificationAction,
} from '@digitalstage/api-client-react'

import { useDispatch } from 'react-redux'
import { logger } from '../logger'

const { trace } = logger('NotificationProvider')

export interface ReportingContextT {
    addNotification: (notification: Omit<Notification, 'id'>) => string
    changeNotification: (id: string, update: Partial<Omit<Notification, 'id'>>) => void
    removeNotification: (id: string) => void
}

const throwAddProviderError = () => {
    throw new Error('Please wrap around your DOM tree with the NotificationProvider')
}

const ReportingContext = React.createContext<ReportingContextT>({
    addNotification: throwAddProviderError,
    changeNotification: throwAddProviderError,
    removeNotification: throwAddProviderError,
})

const ReportingProvider = ({ children }: { children: React.ReactNode }) => {
    const dispatch = useDispatch()
    const [, setTimeouts] = React.useState<any[]>([])

    // Clean up timeouts
    React.useEffect(() => {
        return () => {
            setTimeouts((prev) => {
                prev.forEach((timeout) => clearTimeout(timeout))
                return []
            })
        }
    }, [])

    const changeNotification = React.useCallback(
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

    const addNotification = React.useCallback(
        (notification: Omit<Notification, 'id'>) => {
            trace('addNotification')
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

    const removeNotification = React.useCallback(
        (id: string) => dispatch(removeNotificationAction(id)),
        [dispatch]
    )

    // Memorize published state
    const value = React.useMemo(() => {
        return {
            addNotification,
            changeNotification,
            removeNotification,
        }
    }, [addNotification, changeNotification, removeNotification])

    return <ReportingContext.Provider value={value}>{children}</ReportingContext.Provider>
}

export { ReportingContext, ReportingProvider }

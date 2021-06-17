import React, { createContext, useCallback, useState } from 'react'
import Notification, { KIND } from '../ui/Notification'
import styles from './NotificationCenter.module.css'

interface Note {
    id: number
    date: number
    kind: KIND[keyof KIND]
    message: React.ReactNode
    featured: boolean
    permanent: boolean
}

interface INotificationContext {
    notifications: Note[]
    addNotification: (kind: KIND[keyof KIND], message: React.ReactNode, permanent?: boolean) => void
    changeNotification: (id: number, notification: Partial<Note>) => void
}

const NotificationContext = createContext<INotificationContext>({
    notifications: [],
    addNotification: () => {
        throw new Error('Wrap DOM tree with NotificationProvider')
    },
    changeNotification: () => {
        throw new Error('Wrap DOM tree with NotificationProvider')
    },
})

const NotificationProvider = (props: { children: React.ReactNode }) => {
    const { children } = props
    const [notifications, setNotifications] = useState<Note[]>([])

    const addNotification = useCallback(
        (kind: KIND[keyof KIND], message: React.ReactNode, permanent?: boolean) => {
            setNotifications((prev) => {
                const notification: Note = {
                    id: prev.length,
                    date: Date.now(),
                    kind,
                    message,
                    featured: true,
                    permanent: !!permanent,
                }
                if (!notification.permanent) {
                    setTimeout(() => {
                        setNotifications((p) =>
                            p.map((n) => {
                                if (n.date === notification.date) {
                                    return {
                                        ...n,
                                        featured: false,
                                    }
                                }
                                return n
                            })
                        )
                    }, 5000)
                }
                return [...prev, notification]
            })
        },
        []
    )

    const changeNotification = useCallback(
        (id: number, notification: Partial<Note>) => {
            setNotifications((prev) =>
                prev.map((i) => {
                    if (i.id === id) {
                        return {
                            ...i,
                            ...notification,
                        }
                    }
                    return i
                })
            )
        },
        [notifications]
    )

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
                changeNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

const useNotification = (): INotificationContext =>
    React.useContext<INotificationContext>(NotificationContext)

const NotificationPanel = () => {
    const { notifications, changeNotification } = useNotification()

    return (
        <div className={styles.panel}>
            {notifications
                .filter((notification) => notification.featured)
                .map((notification) => (
                    <Notification
                        closeable
                        onClose={() =>
                            changeNotification(notification.id, {
                                featured: false,
                            })
                        }
                        kind={notification.kind}
                    >
                        {notification.message}
                    </Notification>
                ))}
        </div>
    )
}

const NotificationCenter = () => {
    const { notifications } = useNotification()

    if (notifications.length > 0) {
        return (
            <div>
                {notifications.map((notification) => (
                    <div>{notification.message}</div>
                ))}
            </div>
        )
    }
    return null
}
export type { KIND, Note }
export { useNotification, NotificationPanel, NotificationProvider }
export default NotificationCenter

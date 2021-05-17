import React, { createContext, useCallback, useState } from 'react'

export interface Notification {
    date: Date
    message: string
    type: 'warn' | 'error' | 'info'
    permanent?: boolean
    focus?: boolean
}

interface INotificationContext {
    notifications: Notification[]
    addNotification: (notification: Notification) => any
}

const NotificationContext = createContext<INotificationContext>({
    notifications: [],
    addNotification: () => {
        throw new Error('Wrap DOM tree with NotificationProvider')
    },
})

export const NotificationProvider = (props: { children: React.ReactNode }) => {
    const { children } = props
    const [notifications, setNotifications] = useState<Notification[]>([])

    const addNotification = useCallback((notification: Notification) => {
        setNotifications((prev) => [
            ...prev,
            {
                ...notification,
                focus: true,
            },
        ])
        if (!notification.permanent) {
            setTimeout(() => {
                setNotifications((prev) =>
                    prev.filter((n) => {
                        if (n.date === notification.date) {
                            return {
                                ...n,
                                focus: false,
                            }
                        }
                        return n
                    })
                )
            }, 5000)
        }
    }, [])

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                addNotification,
            }}
        >
            {children}
        </NotificationContext.Provider>
    )
}

const useNotification = (): INotificationContext =>
    React.useContext<INotificationContext>(NotificationContext)

export default useNotification

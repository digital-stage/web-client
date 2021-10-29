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

import React from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useDispatch } from 'react-redux'
import {
    addNotification as addNotificationAction,
    changeNotification as changeNotificationAction,
    removeNotification as removeNotificationAction,
} from '../redux/actions/clientActions'
import { Notification } from '../redux/state/Notifications'

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

const ReportingProvider = ({ children }: { children: React.ReactNode }) : JSX.Element => {
    const dispatch = useDispatch()
    const [, setTimeouts] = React.useState<any[]>([])

    // Clean up timeouts
    React.useEffect(() => () => {
            setTimeouts((prev) => {
                prev.forEach((timeout) => clearTimeout(timeout))
                return []
            })
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
    const value = React.useMemo(() => ({
            addNotification,
            changeNotification,
            removeNotification,
        }), [addNotification, changeNotification, removeNotification])

    return <ReportingContext.Provider value={value}>{children}</ReportingContext.Provider>
}

export { ReportingContext, ReportingProvider }

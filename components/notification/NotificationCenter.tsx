import { NotificationItem } from 'ui/NotificationItem'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from "react";

const NotificationCenter = () => {
    const notifications = useStageSelector((state) =>
        state.notifications.allIds.map((id) => state.notifications.byId[id])
    )
    return (
        <div className="notificationCenter">
            {notifications.map(({id, kind, date, message, stack}) => (
                <NotificationItem key={id} kind={kind}>
                    {new Date(date).toLocaleDateString()}: {message}
                    {stack && (
                        <details className="notificationItemDetails">
                            <summary>Click for error details</summary>
                            {stack}
                        </details>
                    )}
                </NotificationItem>
            ))}
        </div>
    )
}
export { NotificationCenter }

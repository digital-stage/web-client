import { NotificationItem } from 'ui/NotificationItem'
import { changeNotification, useStageSelector } from '@digitalstage/api-client-react'
import { useDispatch } from 'react-redux'

const NotificationBar = () => {
    const dispatch = useDispatch()
    const featuredNotifications = useStageSelector((state) =>
        state.notifications.allIds
            .map((id) => state.notifications.byId[id])
            .filter((notification) => notification.featured || notification.permanent)
    )
    return (
        <div>
            {featuredNotifications.map((notification) => (
                <NotificationItem
                    closeable={!notification.permanent}
                    onClose={() =>
                        dispatch(
                            changeNotification({
                                id: notification.id,
                                featured: false,
                            })
                        )
                    }
                    key={notification.id}
                    kind={notification.kind}
                >
                    {notification.message}
                </NotificationItem>
            ))}
        </div>
    )
}
export { NotificationBar }

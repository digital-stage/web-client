import NotificationItem from '../../ui/Notification'
import { useStageSelector } from '@digitalstage/api-client-react'
import useReporting from '../../api/hooks/useReporting'

const NotificationBar = () => {
    const { changeNotification } = useReporting()
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
                        changeNotification(notification.id, {
                            featured: false,
                        })
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
export default NotificationBar

import useReporting from '../../api/hooks/useReporting'
import Notification from '../../ui/Notification'
import { useStageSelector } from '@digitalstage/api-client-react'

const NotificationCenter = () => {
    const notifications = useStageSelector((state) =>
        state.notifications.allIds.map((id) => state.notifications.byId[id])
    )
    const { removeNotification } = useReporting()
    return (
        <div>
            {notifications.map((notification) => (
                <Notification
                    key={notification.id}
                    closeable={!notification.permanent}
                    onClose={() => removeNotification(notification.id)}
                    kind={notification.kind}
                >
                    {notification.message}
                </Notification>
            ))}
        </div>
    )
}
export default NotificationCenter

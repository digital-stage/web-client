import Notification from '../../ui/Notification'
import { useStageSelector } from '@digitalstage/api-client-react'

const NotificationCenter = () => {
    const notifications = useStageSelector((state) =>
        state.notifications.allIds.map((id) => state.notifications.byId[id])
    )
    return (
        <div>
            {notifications.map((notification) => (
                <Notification key={notification.id} kind={notification.kind}>
                    {new Date(notification.date).toLocaleDateString()}: {notification.message}
                </Notification>
            ))}
        </div>
    )
}
export default NotificationCenter

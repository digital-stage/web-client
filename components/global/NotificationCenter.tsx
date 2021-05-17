import styles from './NotificationCenter.module.css'
import useNotification from '../../hooks/useNotification'

const NotificationCenter = () => {
    const { notifications } = useNotification()
    return (
        <div className={styles.wrapper}>
            {notifications.map((notification) => {
                if (notification.focus) {
                    return (
                        <div className={`${styles.notification} ${styles[notification.type]}`}>
                            {notification.message}
                        </div>
                    )
                }
                return null
            })}
        </div>
    )
}

export default NotificationCenter

import React from 'react'
import styles from './Notification.module.css'

export type TYPE = 'warn' | 'info' | 'success' | 'error'

const Notification = ({ children, type }: { children: React.ReactNode; type?: TYPE }) => (
    <div className={`${styles.notification} ${type ? styles[type] : ''}`}>{children}</div>
)
Notification.defaultProps = {
    type: 'info',
}
export default Notification

import React from 'react'
import styles from './Notification.module.css'

export type TYPE = 'warn' | 'info' | 'success' | 'error'

const Notification = ({
    children,
    type,
    className,
}: {
    children: React.ReactNode
    type?: TYPE
    className?: string
}) => (
    <div className={`${styles.notification} ${type ? styles[type] : ''} ${className || ''}`}>
        {children}
    </div>
)
Notification.defaultProps = {
    type: 'info',
    className: undefined,
}
export default Notification

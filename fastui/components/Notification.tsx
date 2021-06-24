/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { IoMdClose } from 'react-icons/io'
import styles from './Notification.module.css'
import Button from './interaction/Button'

export interface KIND {
    info: 'info'
    warn: 'warn'
    success: 'success'
    error: 'error'
}

const Notification = ({
    children,
    kind,
    className,
    closeable,
    onClose,
    ...props
}: {
    children: React.ReactNode
    kind?: KIND[keyof KIND]
    closeable?: boolean
    onClose?: () => any
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div
        className={`${styles.notification} ${kind ? styles[kind] : ''} ${className || ''}`}
        {...props}
    >
        <div className={styles.message}>{children}</div>
        {closeable && (
            <Button round size="small" className={styles.close} onClick={closeable && onClose}>
                <IoMdClose />
            </Button>
        )}
    </div>
)
Notification.defaultProps = {
    kind: undefined,
    closeable: undefined,
    onClose: undefined,
}
export default Notification

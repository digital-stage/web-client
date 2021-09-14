/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'

const IoMdClose = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z" />
    </svg>
)
export interface KIND {
    info: 'info'
    warn: 'warn'
    success: 'success'
    error: 'error'
}

const NotificationItem = ({
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
    <div className={`notification ${kind ? kind : ''} ${className || ''}`} {...props}>
        <div>{children}</div>
        {closeable && (
            <button className="button round small close" onClick={closeable && onClose}>
                <IoMdClose />
            </button>
        )}
    </div>
)
NotificationItem.defaultProps = {
    kind: undefined,
    closeable: undefined,
    onClose: undefined,
}
export { NotificationItem }

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import styles from './OverlayMenu.module.css'

const OverlayMenu = ({
    menu,
    open,
    onClose,
    className,
    children,
    ...props
}: {
    menu: React.ReactNode
    open: boolean
    onClose: () => void
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return (
        <div className={`${styles.wrapper} ${className || ''}`} {...props}>
            {children}
            {open && (
                <>
                    <div className={styles.backdrop} onClick={onClose} aria-hidden="true" />
                    <div className={styles.menu}>{menu}</div>
                </>
            )}
        </div>
    )
}
export default OverlayMenu

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import Backdrop from 'fastui/components/Backdrop'
import styles from './OverlayMenu.module.css'
import useOpenState from '../../hooks/useOpenState'

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
    const openState = useOpenState(open)
    return (
        <>
            {openState !== 'closed' && <Backdrop onClick={onClose} open={openState} />}
            <div className={`${styles.wrapper} ${className || ''}`} {...props}>
                {children}
                {openState !== 'closed' && (
                    <div className={`${styles.menu} ${styles[openState]}`}>{menu}</div>
                )}
            </div>
        </>
    )
}

export default OverlayMenu

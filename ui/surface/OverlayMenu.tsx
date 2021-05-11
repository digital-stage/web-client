/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useRef } from 'react'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import styles from './OverlayMenu.module.css'
import PrimaryToggleButton from '../button/PrimaryToogleButton'

const OverlayMenu = (
    props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        open: boolean
        onOpen: () => void
        onClose: () => void
        icon: React.ReactNode
        children: React.ReactNode | React.ReactNodeArray
    }
): JSX.Element => {
    const { children, open, onClose, onOpen, icon, className, ...other } = props
    const scrollRef = useRef<HTMLDivElement>()

    useEffect(() => {
        if (scrollRef && scrollRef.current) {
            if (open) {
                disableBodyScroll(scrollRef.current)
            } else {
                enableBodyScroll(scrollRef.current)
            }
        }
    }, [scrollRef, open])

    return (
        <div className={`${styles.wrapper} ${className}`} {...other}>
            <PrimaryToggleButton
                className={styles.menuButton}
                onClick={open ? onClose : onOpen}
                toggled={open}
            >
                {icon}
            </PrimaryToggleButton>
            {open && (
                <>
                    <div onClick={onClose} className={styles.backdrop} role="banner" />
                    <div className={styles.menuWrapper} ref={scrollRef} role="menu">
                        <div className={styles.menu}>{children}</div>
                    </div>
                </>
            )}
        </div>
    )
}
export default OverlayMenu

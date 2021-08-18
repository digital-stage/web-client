/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import useOpenState from './useOpenState'
import Backdrop from './Backdrop'

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
        <div className="nav overlay">
            {openState !== 'closed' && <Backdrop open={openState} onClick={onClose} />}
            <div className={`wrapper ${className || ''}`} {...props}>
                {children}
                {openState !== 'closed' && <nav className={openState}>{menu}</nav>}
            </div>
        </div>
    )
}

export default OverlayMenu

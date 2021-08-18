/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus,jsx-a11y/no-noninteractive-element-interactions */
import React, {ReactNode, useEffect, useRef} from 'react'
import {Portal} from 'react-portal'
import {disableBodyScroll, enableBodyScroll} from 'body-scroll-lock'
import Backdrop from './Backdrop'
import useOpenState from './useOpenState'
import Panel from './Panel'

interface SIZE {
    Default: 'default'
    Full: 'full'
    Small: 'small'
    Auto: 'auto'
}

const ModalHeader = ({children}: { children: React.ReactNode }) => {
    return <header>{children}</header>
}

const ModalButton = (
    {type, ...props}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) => {
    return (
        <div className="modal-button">
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <button type={type || "button"} {...props} />
        </div>
    )
}

const ModalFooter = ({children}: { children: React.ReactNode }) => {
    return <footer>{children}</footer>
}

const Modal = (
    {
        open,
        onClose,
        size,
        children,
        ...other
    }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        children: ReactNode
        size?: SIZE[keyof SIZE]
        open: boolean
        onClose: () => void
    }
): JSX.Element | null => {
    const ref = useRef<HTMLDivElement>(null)
    const openState = useOpenState(open)

    useEffect(() => {
        if (ref.current) {
            const target = ref.current
            if (open) {
                disableBodyScroll(target)
                return () => {
                    enableBodyScroll(target)
                }
            }
        }
        return undefined
    }, [ref, open])

    if (openState !== 'closed') {
        return (
            <Portal>
                <Backdrop
                    ref={ref}
                    onTouchStart={onClose}
                    onMouseDown={onClose}
                    open={openState}
                    role="button"
                >
                    <div
                        className={`modal ${size} ${openState}`}
                    >
                        <div className="inner"
                             onTouchStart={(e) => {
                                 e.stopPropagation()
                             }}
                             onMouseDown={(e) => {
                                 e.stopPropagation()
                             }}
                             role="dialog">
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <Panel kind="white" {...other}>
                                {children}
                                <button className={`round close`} onClick={onClose}>
                                    <svg width="10" height="10" viewBox="0 0 10 10" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M9 1L5 5M1 9L5 5M5 5L1 1M5 5L9 9" strokeWidth="2"
                                              strokeLinecap="round"/>
                                    </svg>
                                </button>
                            </Panel>
                        </div>
                    </div>
                </Backdrop>
            </Portal>
        )
    }

    return null
}
Modal.defaultProps = {
    size: undefined,
}
export type {SIZE}
export {ModalHeader, ModalFooter, ModalButton}
export default Modal

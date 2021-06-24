/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus,jsx-a11y/no-noninteractive-element-interactions */
import React, { ReactNode, useEffect, useRef } from 'react'
import { Portal } from 'react-portal'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import styles from './Modal.module.css'
import Button, { ButtonProps } from './interaction/Button'
import WhitePanel from './panels/WhitePanel'
import useOpenState from '../hooks/useOpenState'
import Backdrop from './Backdrop'

interface SIZE {
    Default: 'default'
    Full: 'full'
    Small: 'small'
    Auto: 'auto'
}

const ModalHeader = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.modalHeader}>{children}</div>
}

const ModalButton = (props: ButtonProps) => {
    return (
        <div className={styles.modalButton}>
            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
            <Button {...props} />
        </div>
    )
}

const ModalFooter = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.modalFooter}>{children}</div>
}

const Modal = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        children: ReactNode
        size?: SIZE[keyof SIZE]
        open: boolean
        onClose: () => void
    }
) => {
    const { open, onClose, size, ...other } = props
    const ref = useRef<HTMLDivElement>()
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

    let sizeClass = ''
    switch (size) {
        case 'full': {
            sizeClass = styles.full
            break
        }
        case 'small': {
            sizeClass = styles.small
            break
        }
        case 'auto': {
            sizeClass = styles.auto
            break
        }
        default:
        case 'default': {
            sizeClass = styles.default
            break
        }
    }

    return (
        openState !== 'closed' && (
            <Portal>
                <Backdrop
                    ref={ref}
                    onTouchStart={onClose}
                    onMouseDown={onClose}
                    open={openState}
                    role="button"
                >
                    <div
                        className={`${styles.modal} ${sizeClass} ${styles[openState]}`}
                        onTouchStart={(e) => {
                            e.stopPropagation()
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}
                        role="dialog"
                    >
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <WhitePanel aria-modal="true" {...other} />
                    </div>
                </Backdrop>
            </Portal>
        )
    )
}
Modal.defaultProps = {
    size: undefined,
}
export type { SIZE }
export { ModalHeader, ModalFooter, ModalButton }
export default Modal

/* eslint-disable jsx-a11y/click-events-have-key-events,jsx-a11y/interactive-supports-focus,jsx-a11y/no-noninteractive-element-interactions */
import React, { ReactNode, useEffect, useRef } from 'react'
import { Portal } from 'react-portal'
import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import styles from './Modal.module.css'
import Panel, { LEVEL } from './Panel'
import Block from './Block'
import Button, { ButtonProps } from './Button'

interface SIZE {
    Default: 'default'
    Full: 'full'
    Small: 'small'
    Auto: 'auto'
}

const ModalHeader = ({ children }: { children: React.ReactNode }) => {
    return <Block paddingBottom={4}>{children}</Block>
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
    return (
        <Block width="full" paddingTop={4} justify="end">
            {children}
        </Block>
    )
}

const Modal = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        children: ReactNode
        level?: LEVEL[keyof LEVEL]
        size?: SIZE[keyof SIZE]
        open: boolean
        onClose: () => void
    }
) => {
    const { open, onClose, size, ...other } = props
    const ref = useRef<HTMLDivElement>()

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
        open && (
            <Portal>
                <div
                    ref={ref}
                    className={styles.backdrop}
                    onTouchStart={onClose}
                    onMouseDown={onClose}
                    role="button"
                >
                    <div
                        className={`${styles.modal} ${sizeClass}`}
                        onTouchStart={(e) => {
                            e.stopPropagation()
                        }}
                        onMouseDown={(e) => {
                            e.stopPropagation()
                        }}
                        role="dialog"
                    >
                        <Panel level="level5" aria-modal="true">
                            {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                            <Block padding={4} {...other} />
                        </Panel>
                    </div>
                </div>
            </Portal>
        )
    )
}
Modal.defaultProps = {
    level: undefined,
    size: undefined,
}
export type { SIZE, LEVEL }
export { ModalHeader, ModalFooter, ModalButton }
export default Modal

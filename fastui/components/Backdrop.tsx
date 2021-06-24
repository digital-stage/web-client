/* eslint-disable react/jsx-props-no-spreading */
import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { OpenState } from '../hooks/useOpenState'
import styles from './Backdrop.module.css'

const Backdrop = ({
    className,
    open,
    ...props
}: {
    open: OpenState[keyof OpenState]
} & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return <div className={`${styles.backdrop} ${styles[open]} ${className || ''}`} {...props} />
}
export default Backdrop

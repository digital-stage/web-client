/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React from 'react'
import styles from './DangerButton.module.css'

interface SIZE {
    default: 'default'
    small: 'small'
    large: 'large'
}

interface WIDTH {
    full: 'full'
    auto: 'auto'
}

const DangerButton = ({
    size,
    round,
    toggled,
    className,
    width,
    ...props
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    round?: boolean
    toggled?: boolean
    width?: WIDTH[keyof WIDTH]
    size?: SIZE[keyof SIZE]
}): JSX.Element => (
    <button
        className={`
        ${styles.button} 
        ${round ? styles.round : styles.elliptic} ${toggled === false && styles.inactive} 
        ${size ? styles[size] : ''} 
        ${width ? styles[width] : ''} 
        ${className}`}
        {...props}
    />
)
DangerButton.defaultProps = {
    round: undefined,
    toggled: undefined,
    width: undefined,
    size: undefined,
}
export default DangerButton

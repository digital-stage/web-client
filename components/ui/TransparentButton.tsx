/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React from 'react'
import styles from './TransparentButton.module.css'

const TransparentButton = ({
    icon,
    className,
    children,
    ...other
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
    icon?: React.ReactNode
}) => {
    return (
        <button className={`${styles.button} ${className}`} {...other}>
            {icon && <div className={styles.icon}>{icon}</div>}
            {children}
        </button>
    )
}
TransparentButton.defaultProps = {
    icon: undefined,
}
export default TransparentButton

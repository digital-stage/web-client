/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React from 'react'
import styles from './HeadlineButton.module.css'

const PrimaryHeadlineButton = (
    props: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > & {
        toggled?: boolean
    }
): JSX.Element => {
    const { className, toggled, ...other } = props
    return (
        <button
            className={`${styles.button} ${styles.primary} ${toggled && styles.active} ${
                styles.toggled
            } ${className || ''} ${other}`}
            {...other}
        />
    )
}
PrimaryHeadlineButton.defaultProps = {
    toggled: undefined,
}

const SecondaryHeadlineButton = (
    props: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > & {
        toggled?: boolean
    }
): JSX.Element => {
    const { className, toggled, ...other } = props
    return (
        <button
            className={`${styles.button} ${styles.secondary} ${toggled && styles.active} ${
                styles.toggled
            } ${className || ''} ${other}`}
            {...other}
        />
    )
}
SecondaryHeadlineButton.defaultProps = {
    toggled: undefined,
}

export { PrimaryHeadlineButton, SecondaryHeadlineButton }

export default PrimaryHeadlineButton

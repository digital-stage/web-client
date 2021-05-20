/* eslint-disable react/jsx-props-no-spreading,react/button-has-type */
import React from 'react'
import styles from './Button.module.scss'

interface SIZE {
    default: 'default'
    small: 'small'
    large: 'large'
}

interface WIDTH {
    full: 'full'
    auto: 'auto'
}

interface KIND {
    primary: 'primary'
    secondary: 'secondary'
    tertiary: 'tertiary'
    minimal: 'minimal'
    danger: 'danger'
}

type ButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    round?: boolean
    toggled?: boolean
    width?: WIDTH[keyof WIDTH]
    size?: SIZE[keyof SIZE]
    kind?: KIND[keyof KIND]
}

const Button = ({
    size,
    round,
    toggled,
    className,
    width,
    kind,
    ...props
}: ButtonProps): JSX.Element => (
    <button
        className={`
        ${styles.button} 
        ${round ? styles.round : styles.elliptic} ${toggled === false && styles.inactive} 
        ${size ? styles[size] : ''} 
        ${width ? styles[width] : ''} 
        ${kind ? styles[kind] : styles.primary} 
        ${className}`}
        {...props}
    />
)
Button.defaultProps = {
    round: undefined,
    toggled: undefined,
    width: undefined,
    size: undefined,
    kind: undefined,
}

const PrimaryButton = (props: Exclude<ButtonProps, 'kind'>): JSX.Element => (
    <Button kind="primary" {...props} />
)
const SecondaryButton = (props: Exclude<ButtonProps, 'kind'>): JSX.Element => (
    <Button kind="secondary" {...props} />
)
const TertiaryButton = (props: Exclude<ButtonProps, 'kind'>): JSX.Element => (
    <Button kind="tertiary" {...props} />
)
const DangerButton = (props: Exclude<ButtonProps, 'kind'>): JSX.Element => (
    <Button kind="danger" {...props} />
)
const MinimalButton = ({
    children,
    icon,
    ...other
}: Exclude<ButtonProps, 'kind'> & {
    icon?: React.ReactNode
}): JSX.Element => (
    <Button kind="minimal" {...other}>
        {icon && <div className={styles.icon}>{icon}</div>}
        {children}
    </Button>
)
MinimalButton.defaultProps = {
    icon: undefined,
}
export type { ButtonProps, SIZE, WIDTH, KIND }
export { PrimaryButton, SecondaryButton, TertiaryButton, DangerButton, MinimalButton }
export default Button

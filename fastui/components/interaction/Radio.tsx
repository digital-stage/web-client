import React from 'react'
import styles from './Radio.module.css'

type RadioProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
> & {
    label?: React.ReactNode
    light?: boolean
}

const RadioPanel = ({
    className,
    light,
    ...others
}: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
    light?: boolean
}) => {
    return (
        <div
            className={`${styles.panel} ${light ? styles.light : ''} ${className || ''}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        />
    )
}
RadioPanel.defaultProps = {
    light: undefined,
}

const Radio = ({ className, label, light, ...others }: RadioProps) => {
    if (label)
        return (
            <label className={`${styles.wrapper} ${light ? styles.light : ''}`}>
                <input
                    type="radio"
                    className={`${styles.radio} ${styles.withLabel} ${className || ''}`}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...others}
                />
                <div className={styles.label}>{label}</div>
            </label>
        )
    return (
        <input
            type="radio"
            className={`${styles.radio} ${className || ''}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        />
    )
}
Radio.defaultProps = {
    label: undefined,
    light: undefined,
}
export type { RadioProps }
export { RadioPanel }
export default Radio

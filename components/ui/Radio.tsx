import React from 'react'
import styles from './Radio.module.css'

type RadioProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
> & {
    label?: React.ReactNode
}

const Radio = ({ className, label, ...others }: RadioProps) => {
    if (label)
        return (
            <label className={styles.wrapper}>
                <input
                    type="radio"
                    className={`${styles.radio} ${styles.withLabel} ${className}`}
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...others}
                />
                <div className={styles.label}>{label}</div>
            </label>
        )
    return (
        <input
            type="radio"
            className={`${styles.radio} ${className}`}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...others}
        />
    )
}
Radio.defaultProps = {
    label: undefined,
}
export type { RadioProps }
export default Radio

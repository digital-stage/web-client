/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState } from 'react'
import { BsEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'
import styles from './Input.module.scss'

const Input = ({
    light,
    type,
    label,
    error,
    className,
    ...other
}: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label: string
    error?: string
    light?: boolean
}) => {
    const [inputType, setInputType] = useState<string>(type)
    const errorRef = useRef<HTMLDivElement>()

    return (
        <div className={`${styles.wrapper} ${light ? styles.light : ''}`}>
            <div className={`${styles.inputWrapper}  ${error ? styles.error : ''}`}>
                <label>
                    <input
                        type={inputType}
                        className={`
                          ${styles.input} 
                          ${type === 'password' ? styles.inputPassword : ''}
                          ${className || ''}
                        `}
                        aria-label={label}
                        aria-required={other.required}
                        aria-describedby={errorRef.current ? errorRef.current.id : undefined}
                        {...other}
                    />
                    <span className={styles.label}>{label}</span>
                </label>

                {type === 'password' && (
                    <div className={styles.showPassword}>
                        {inputType === 'password' ? (
                            <BsFillEyeFill onClick={() => setInputType('text')} />
                        ) : (
                            <BsEyeSlashFill onClick={() => setInputType('password')} />
                        )}
                    </div>
                )}
            </div>
            <div ref={errorRef} className={styles.notification}>
                {error}
            </div>
        </div>
    )
}
Input.defaultProps = {
    error: undefined,
    light: undefined,
}
export default Input

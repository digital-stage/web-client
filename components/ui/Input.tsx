/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState } from 'react'
import { BsEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'
import styles from './Input.module.css'

const Input = (
    props: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
    > & {
        label: string
        error?: string
    }
) => {
    const { type, label, error, className, ...other } = props
    const [inputType, setInputType] = useState<string>(type)
    const errorRef = useRef<HTMLDivElement>()

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.inputWrapper}  ${error ? styles.error : ''}`}>
                <label>
                    <input
                        type={inputType}
                        className={`
                          ${styles.input} 
                          ${type === 'password' ? styles.inputPassword : ''}
                          ${className}
                        `}
                        aria-label={label}
                        aria-required={other.required}
                        aria-describedby={errorRef.current && errorRef.current.id}
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
}
export default Input

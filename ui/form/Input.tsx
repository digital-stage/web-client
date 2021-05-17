/* eslint-disable react/jsx-props-no-spreading */
import uniqueId from 'lodash/uniqueId'
import { useState } from 'react'
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
    const { type, label, error, id: propsId, className, ...other } = props
    const [inputType, setInputType] = useState<string>(type)
    const [id] = useState(propsId || uniqueId('input-'))
    const [errorId] = useState(uniqueId('error-'))

    return (
        <div className={styles.wrapper}>
            <div className={`${styles.inputWrapper}  ${error ? styles.error : ''}`}>
                <input
                    id={id}
                    type={inputType}
                    className={`${styles.input} ${className} ${
                        type === 'password' ? styles.inputPassword : ''
                    }`}
                    aria-label={label}
                    aria-required={other.required}
                    aria-describedby={errorId}
                    {...other}
                />
                <label className={styles.label} htmlFor={id}>
                    {label}
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
            <div id={errorId} className={styles.notification}>
                {error}
            </div>
            <style jsx>{`
                input:-webkit-autofill,
                input:-webkit-autofill:hover,
                input:-webkit-autofill:focus {
                    -webkit-text-fill-color: rgb(244, 244, 244);
                    border-bottom-color: transparent;
                    box-shadow: rgb(80 80 80) 0px 0px 0px 1000px inset;
                }
            `}</style>
        </div>
    )
}
export default Input

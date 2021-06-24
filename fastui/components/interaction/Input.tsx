/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState } from 'react'
import { BsEyeSlashFill, BsFillEyeFill } from 'react-icons/bs'

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
        <div className={`inputOuter ${light ? 'light' : ''}`}>
            <div className={`inputInner  ${error ? 'error' : ''}`}>
                <label>
                    <input
                        type={inputType}
                        className={`
                          input
                          ${type === 'password' ? 'inputPassword' : ''}
                          ${className || ''}
                        `}
                        aria-label={label}
                        aria-required={other.required}
                        aria-describedby={errorRef.current ? errorRef.current.id : undefined}
                        {...other}
                    />
                    <span className="inputLabel">{label}</span>
                </label>

                {type === 'password' && (
                    <div className="inputShowPassword">
                        {inputType === 'password' ? (
                            <BsFillEyeFill onClick={() => setInputType('text')} />
                        ) : (
                            <BsEyeSlashFill onClick={() => setInputType('password')} />
                        )}
                    </div>
                )}
            </div>
            <div ref={errorRef} className="inputNotification">
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

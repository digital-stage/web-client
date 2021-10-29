/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react'

export const BsEyeSlashFill = (): JSX.Element => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 16 16"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.79 12.912l-1.614-1.615a3.5 3.5 0 01-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 002.79-.588zM5.21 3.088A7.028 7.028 0 018 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 00-4.474-4.474L5.21 3.089z" />
        <path d="M5.525 7.646a2.5 2.5 0 002.829 2.829l-2.83-2.829zm4.95.708l-2.829-2.83a2.5 2.5 0 012.829 2.829z" />
        <path
            fillRule="evenodd"
            d="M13.646 14.354l-12-12 .708-.708 12 12-.708.708z"
            clipRule="evenodd"
        />
    </svg>
)

export const BsFillEyeFill = (): JSX.Element => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 16 16"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M10.5 8a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        <path
            fillRule="evenodd"
            d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7z"
            clipRule="evenodd"
        />
    </svg>
)

const TextInput = ({
    light,
    type,
    label,
    error,
    className,
    ...other
}: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
    label?: string
    error?: string
    light?: boolean
}): JSX.Element => {
    const [inputType, setInputType] = React.useState<string | undefined>(type)
    const errorRef = React.useRef<HTMLDivElement>(null)

    return (
        <div className={`text-input ${light ? 'light' : ''}`}>
            <div className={`wrapper ${error ? 'error' : ''}`}>
                <label>
                    <input
                        type={inputType}
                        className={`${!label ? 'no-label' : ''} ${
                            type === 'password' ? 'password' : ''
                        } ${className || ''}
                        `}
                        aria-label={label}
                        aria-required={other.required}
                        aria-describedby={errorRef.current ? errorRef.current.id : undefined}
                        {...other}
                    />
                    {label && <span className="label">{label}</span>}
                </label>

                {type === 'password' && (
                    <div
                        className="toggle"
                        onClick={() =>
                            setInputType((prev) => (prev === 'text' ? 'password' : 'text'))
                        }
                    >
                        {inputType === 'password' ? <BsFillEyeFill /> : <BsEyeSlashFill />}
                    </div>
                )}
            </div>
            <div ref={errorRef} className="note">
                {error}
            </div>
        </div>
    )
}
TextInput.defaultProps = {
    error: undefined,
    light: undefined,
}
export { TextInput }

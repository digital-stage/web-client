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

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import {TextInput} from './TextInput'

const LiveInput = (
    props: Omit<
        React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
        'value' | 'onChange'
    > & {
        onChange: (value: string) => void
        value?: string
        label: string
        error?: string
    }
) => {
    const { value, onChange, ...other } = props
    const [changed, setChanged] = React.useState<boolean>(false)
    const [actualValue, setActualValue] = React.useState<string>(value || '')

    React.useEffect(() => {
        setActualValue(value || '')
    }, [value])

    React.useEffect(() => {
        const timeOutId = setTimeout(() => {
            if (changed) {
                onChange(actualValue)
                setChanged(false)
            }
        }, 1000)
        return () => clearTimeout(timeOutId)
    }, [actualValue, changed, onChange])

    return (
        <TextInput
            value={actualValue}
            onChange={(event) => {
                setActualValue(event.currentTarget.value)
                setChanged(true)
            }}
            onBlur={() => {
                if (changed) {
                    onChange(actualValue)
                    setChanged(false)
                }
            }}
            {...other}
        />
    )
}
LiveInput.defaultProps = {
    error: undefined,
}
export { LiveInput }

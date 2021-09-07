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

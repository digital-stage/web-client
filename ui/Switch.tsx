import React from 'react'

export interface SIZE {
    default: undefined
    small: 'small'
}

const Switch = ({
    size,
    round,
    className,
    ...props
}: Omit<
    React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>,
    'size'
> & {
    size?: SIZE[keyof SIZE]
    round?: boolean
}) => {
    return (
        <div className={`switch ${size ? size : ''} ${className || ''}`}>
            <input type="checkbox" {...props} />
            <span className={`slider ${round ? 'round' : ''}`} />
        </div>
    )
}

export default Switch

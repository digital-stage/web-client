import React, { ReactEventHandler } from 'react'

export interface SIZE {
    default: undefined
    small: 'small'
}

const Switch = ({
    size,
    round,
    checked,
    onChange,
    className,
}: {
    size?: SIZE[keyof SIZE]
    round?: boolean
    checked: boolean
    onChange: ReactEventHandler<HTMLInputElement>
    className?: string
}) => {
    return (
        <div className={`switch ${size ? size : ''} ${className || ''}`}>
            <input type="checkbox" checked={!!checked} onChange={onChange} />
            <span className={`slider ${round ? 'round' : ''}`} />
        </div>
    )
}

export default Switch

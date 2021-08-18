import React, {ReactEventHandler} from 'react'

const Switch = ({
                    round,
                    checked,
                    onChange,
                    className,
                }: {
    round?: boolean
    checked: boolean
    onChange: ReactEventHandler<HTMLInputElement>
    className?: string
}) => {
    return (
        <div className={`switch ${className || ''}`}>
            <input type="checkbox" checked={!!checked} onChange={onChange}/>
            <span className={`slider ${round ? 'round' : ''}`}/>
        </div>
    )
}

export default Switch

import React, { ForwardedRef } from 'react'
import { DetailedHTMLProps, HTMLAttributes } from 'react'
import { OpenState } from './useOpenState'

const Backdrop = React.forwardRef(
    (
        {
            className,
            open,
            ...props
        }: {
            open: OpenState[keyof OpenState]
        } & DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
        ref: ForwardedRef<HTMLDivElement>
    ) => {
        return (
            <div ref={ref} className={`backdrop ${open} ${className || ''}`} {...props} />
        )
    }
)
Backdrop.displayName = 'Backdrop'
export { Backdrop }

import React from 'react'
import classes from './DefaultContainer.module.css'

const DefaultContainer = ({
    children,
    className,
    ...props
}: { children: React.ReactNode } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>) => {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div className={`${classes.container} ${className || ''}`} {...props}>
            {children}
        </div>
    )
}
export default DefaultContainer

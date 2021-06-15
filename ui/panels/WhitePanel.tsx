import React from 'react'
import classes from './WhitePanel.module.css'

const WhitePanel = ({
    children,
    className,
    ...props
}: { children: React.ReactNode } & React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>) => {
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <div className={`${classes.panel} ${className || ''}`} {...props}>
            {children}
        </div>
    )
}
export default WhitePanel

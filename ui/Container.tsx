import React from 'react'

export enum SIZE {
    small = 'small',
    tiny = 'tiny',
}

const Container = ({
    children,
    size,
    className,
    ...props
}: { size?: keyof typeof SIZE; } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>) => {
    return (
        <div
            className={`container ${size ? size : ''} ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    )
}
export default Container

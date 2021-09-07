import React from 'react'

export enum SIZE {
    small = 'small',
    tiny = 'tiny',
}

const Container = ({
    children,
    size,
    flex,
    className,
    ...props
}: { size?: keyof typeof SIZE; flex?: boolean } & React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
>) => {
    return (
        <div
            className={`container ${flex ? 'flex' : ''}  ${size ? size : ''} ${className || ''}`}
            {...props}
        >
            {children}
        </div>
    )
}
export { Container }

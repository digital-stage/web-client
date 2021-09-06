import React from 'react'

export interface KIND {
    black: 'black'
    white: 'white'
}

const Panel = ({
                   kind,
                   fixed,
                   children,
                   className,
                   ...props
               }: {
    kind?: KIND[keyof KIND]
    fixed?: boolean
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>) => {
    return (
        <div
            className={`panel ${kind || ''} ${
                fixed ? 'fixed' : ''
            } ${className || ''}`}
            aria-modal="true"
            {...props}
        >
            {children}
        </div>
    )
}
export { Panel }

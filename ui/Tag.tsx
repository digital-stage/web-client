import React from "react";


export interface KIND {
    primary: "primary",
    contrast: "constrast",
    success: "success",
    warn: "warn",
    danger: "danger"
}

const Tag = ({
                 kind,
                 className,
                 ...props
             }: {
    kind?: KIND[keyof KIND]
} & React.DetailedHTMLProps<React.HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>) => <span
    className={`tag micro ${kind || ''} ${className || ''}`} {...props}/>
export { Tag }
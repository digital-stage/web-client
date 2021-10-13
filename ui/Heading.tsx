import React, {ReactNode} from "react";

export const Heading1 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h1 className={`h1 ${className || ''}`} {...props}>{children}</h1>


export const Heading2 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h2 className={`h2 ${className || ''}`} {...props}>{children}</h2>


export const Heading3 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h3 className={`h3 ${className || ''}`} {...props}>{children}</h3>


export const Heading4 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h4 className={`h4 ${className || ''}`} {...props}>{children}</h4>


export const Heading5 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h5 className={`h5 ${className || ''}`} {...props}>{children}</h5>


export const Heading6 = ({
                             children,
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement> & { children: ReactNode }) =>
    <h6 className={`h6 ${className || ''}`} {...props}>{children}</h6>
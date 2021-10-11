import React from "react";

export const Heading1 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h1 className={`h1 ${className || ''}`} {...props}/>


export const Heading2 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h2 className={`h2 ${className || ''}`} {...props}/>


export const Heading3 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h3 className={`h3 ${className || ''}`} {...props}/>


export const Heading4 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h4 className={`h4 ${className || ''}`} {...props}/>


export const Heading5 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h5 className={`h5 ${className || ''}`} {...props}/>


export const Heading6 = ({
                             className,
                             ...props
                         }: React.DetailedHTMLProps<React.HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>) =>
    <h6 className={`h6 ${className || ''}`} {...props}/>
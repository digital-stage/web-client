import React from 'react'
import classes from './TextLink.module.css'

const TextLink = ({
    className,
    ...props
}: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
    // eslint-disable-next-line react/jsx-props-no-spreading,jsx-a11y/anchor-has-content
    return <a className={`${classes.link} ${className || ''}`} {...props} />
}
export default TextLink

import React from 'react'
import Link from 'next/link'
import { UrlObject } from 'url'

const AltListItem = ({
    href,
    children,
    onSelect,
    selected,
    selectable,
    ...props
}: {
    href?: string | UrlObject
    onSelect?: React.MouseEventHandler<HTMLAnchorElement>
    selectable?: boolean
    selected?: boolean
} & React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => {
    return (
        <li {...props}>
            {href ? (
                <Link href={href}>
                    <a
                        onClick={onSelect}
                        className={`${selectable ? 'selectable' : ''} ${
                            selected ? 'selected' : ''
                        }`}
                    >
                        {children}
                        <div className="icon">
                            <svg
                                stroke="currentColor"
                                fill="currentColor"
                                strokeWidth="0"
                                viewBox="0 0 24 24"
                                height="1em"
                                width="1em"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <g>
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M13.172 12l-4.95-4.95 1.414-1.414L16 12l-6.364 6.364-1.414-1.414z" />
                                </g>
                            </svg>
                        </div>
                    </a>
                </Link>
            ) : (
                <a onClick={onSelect} className={`${selected ? 'selected' : ''}`}>
                    {children}
                </a>
            )}
        </li>
    )
}

const AltList = ({
    children,
    className,
    ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => {
    return (
        <ul className={`altList ${className || ''}`} {...props}>
            {children}
        </ul>
    )
}
export { AltListItem }
export default AltList

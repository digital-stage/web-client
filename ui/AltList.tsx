/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react'
import Link from 'next/link'
import {UrlObject} from 'url'

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
} & React.DetailedHTMLProps<React.LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>) => (
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

const AltList = ({
    children,
    className,
    ...props
}: React.DetailedHTMLProps<React.HTMLAttributes<HTMLUListElement>, HTMLUListElement>) => (
        <ul className={`altList ${className || ''}`} {...props}>
            {children}
        </ul>
    )
export { AltListItem }
export { AltList }

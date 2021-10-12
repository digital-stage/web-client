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

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'

const IoMdClose = () => (
    <svg
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="0"
        viewBox="0 0 512 512"
        height="1em"
        width="1em"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M405 136.798L375.202 107 256 226.202 136.798 107 107 136.798 226.202 256 107 375.202 136.798 405 256 285.798 375.202 405 405 375.202 285.798 256z" />
    </svg>
)
export interface KIND {
    info: 'info'
    warn: 'warn'
    success: 'success'
    error: 'error'
}

const NotificationItem = ({
    children,
    kind,
    className,
    closeable,
    onClose,
    ...props
}: {
    children: React.ReactNode
    kind?: KIND[keyof KIND]
    closeable?: boolean
    onClose?: () => any
} & React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLDivElement>, HTMLDivElement>) => (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions
    <div className={`notification ${kind || ''} ${className || ''}`} {...props}>
        <div>{children}</div>
        {closeable && (
            <button className="button round small close" onClick={closeable && onClose}>
                <IoMdClose />
            </button>
        )}
    </div>
)
NotificationItem.defaultProps = {
    kind: undefined,
    closeable: undefined,
    onClose: undefined,
}
export { NotificationItem }

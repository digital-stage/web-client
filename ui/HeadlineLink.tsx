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

/* eslint-disable react/jsx-props-no-spreading,jsx-a11y/anchor-has-content */
import React from 'react'
import {useRouter} from 'next/router'
import Link from 'next/link'
import {LinkProps} from 'next/dist/client/link'

const PrimaryHeadlineLink = (
    props: React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
    > &
        LinkProps
): JSX.Element => {
    const { href, locale, as, replace, scroll, shallow, passHref, prefetch, className, ...other } =
        props
    const { asPath } = useRouter()
    return (
        <Link
            href={href}
            locale={locale}
            as={as}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            passHref={passHref}
            prefetch={prefetch}
        >
            <a
                className={`headline-button primary ${asPath === href ? 'active' : ''} ${
                    className || ''
                }`}
                {...other}
            />
        </Link>
    )
}

const SecondaryHeadlineLink = (
    props: React.DetailedHTMLProps<
        React.AnchorHTMLAttributes<HTMLAnchorElement>,
        HTMLAnchorElement
    > &
        LinkProps
): JSX.Element => {
    const { href, locale, as, replace, scroll, shallow, passHref, prefetch, className, ...other } =
        props
    const { asPath } = useRouter()
    return (
        <Link
            href={href}
            locale={locale}
            as={as}
            replace={replace}
            scroll={scroll}
            shallow={shallow}
            passHref={passHref}
            prefetch={prefetch}
        >
            <a
                className={`headline-button secondary ${asPath === href ? 'active' : ''} ${
                    className || ''
                }`}
                {...other}
            />
        </Link>
    )
}

export { PrimaryHeadlineLink, SecondaryHeadlineLink }


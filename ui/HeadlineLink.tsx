/* eslint-disable react/jsx-props-no-spreading,jsx-a11y/anchor-has-content */
import React from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { LinkProps } from 'next/dist/client/link'

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


/* eslint-disable jsx-a11y/anchor-is-valid */
import * as React from 'react'
import { useRouter } from 'next/router'
import { useIntl } from 'react-intl'
import Link from 'next/link'

const AuthNavigation = (): JSX.Element => {
    const { pathname } = useRouter()
    const { formatMessage } = useIntl()
    const f = (id) => formatMessage({ id })

    return (
        <div>
            <Link href="/account/login" passHref>
                <a className={pathname === '/account/login' && 'active'}>{f('login')}</a>
            </Link>
            <Link href="/account/signup" passHref>
                <a className={pathname === '/account/signup' && 'active'}>{f('signUp')}</a>
            </Link>
            <style jsx>{`
                div {
                    width: 100%;
                    display: flex;
                }
                a {
                    width: 50%;
                    margin: 0 2px 16px;
                    font-family: Poppins, Verdana, sans-serif;
                    font-size: 18px;
                    padding: 8px;
                    border-bottom-width: 2px;
                    border-bottom-style: solid;
                    border-bottom-color: transparent;
                    transition: border 1s ease-out 0s;
                    cursor: pointer;
                    text-align: center;
                }
                a:hover {
                    border-bottom-color: var(---danger, #f20544);
                }
                a.active {
                    border-bottom-color: var(---danger, #f20544);
                }
            `}</style>
        </div>
    )
}

export default AuthNavigation

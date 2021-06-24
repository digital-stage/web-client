import Image from 'next/image'
import React from 'react'
import TinyContainer from './container/TinyContainer'
import { SecondaryHeadlineLink } from './interaction/HeadlineLink'
import BlackPanel from './panels/BlackPanel'
import classes from './AuthLayout.module.css'

const AuthLayout = ({ children, showMenu }: { children: React.ReactNode; showMenu?: boolean }) => {
    return (
        <TinyContainer>
            <div className={classes.logoWrapper}>
                <Image src="/static/logo-full.svg" width={180} height={93} />
            </div>
            <BlackPanel>
                {showMenu && (
                    <div className={classes.nav}>
                        <SecondaryHeadlineLink className={classes.navItem} href="/account/login">
                            <h4>Login</h4>
                        </SecondaryHeadlineLink>
                        <SecondaryHeadlineLink className={classes.navItem} href="/account/signup">
                            <h4>Registrieren</h4>
                        </SecondaryHeadlineLink>
                    </div>
                )}
                {children}
            </BlackPanel>
        </TinyContainer>
    )
}
AuthLayout.defaultProps = {
    showMenu: undefined,
}
export default AuthLayout

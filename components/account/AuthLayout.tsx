import Image from 'next/image'
import React, { useEffect } from 'react'
import classes from './AuthLayout.module.scss'
import { SecondaryHeadlineLink } from '../../ui/HeadlineLink'
import { useRouter } from 'next/router'
import Container from '../../ui/Container'
import Panel from 'ui/Panel'

const AuthLayout = ({ children, showMenu }: { children: React.ReactNode; showMenu?: boolean }) => {
    const { prefetch } = useRouter()
    useEffect(() => {
        if (prefetch && showMenu) {
            prefetch('/login')
        }
    }, [prefetch, showMenu])
    return (
        <Container size="tiny">
            <div className={classes.logoWrapper}>
                <Image alt="Digital Stage" src="/logo-full.svg" width={180} height={93} />
            </div>
            <Panel kind="black">
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
            </Panel>
        </Container>
    )
}
AuthLayout.defaultProps = {
    showMenu: undefined,
}
export default AuthLayout

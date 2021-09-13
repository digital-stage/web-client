import Image from 'next/image'
import React, { useEffect } from 'react'
import {SecondaryHeadlineLink  } from 'ui/HeadlineLink'
import { useRouter } from 'next/router'
import { Container } from 'ui/Container'
import {Panel} from 'ui/Panel'

const AuthLayout = ({ children, showMenu }: { children: React.ReactNode; showMenu?: boolean }) => {
    const { prefetch } = useRouter()
   React.useEffect(() => {
        if (prefetch && showMenu) {
            prefetch('/login')
        }
    }, [prefetch, showMenu])
    return (
        <Container className="authLayout" size="tiny">
            <div className="authLogo">
                <Image alt="Digital Stage" src="/logo-full.svg" width={180} height={93} />
            </div>
            <Panel kind="black">
                {showMenu && (
                    <nav className="authNav">
                        <SecondaryHeadlineLink className="authNavItem" href="/account/login">
                            <h4>Login</h4>
                        </SecondaryHeadlineLink>
                        <SecondaryHeadlineLink className="navItem" href="/account/signup">
                            <h4>Registrieren</h4>
                        </SecondaryHeadlineLink>
                    </nav>
                )}
                {children}
            </Panel>
        </Container>
    )
}
AuthLayout.defaultProps = {
    showMenu: undefined,
}
export {AuthLayout}

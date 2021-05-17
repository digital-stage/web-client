import Link from 'next/link'
import React from 'react'
import AuthContainer from '../../components/AuthContainer'

const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link href={href} passHref>
        <a>{children}</a>
    </Link>
)

const Login = () => {
    return (
        <AuthContainer>
            <nav>
                <NavLink href="/account/login">Login</NavLink>
                <NavLink href="/account/signup">Registrieren</NavLink>x
            </nav>
        </AuthContainer>
    )
}
export default Login

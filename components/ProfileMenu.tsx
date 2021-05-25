import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import React, { useEffect, useRef, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import Link from 'next/link'
import styles from './ProfileMenu.module.css'
import { DangerButton, SecondaryButton } from './ui/Button'
import Paragraph from './ui/Paragraph'
import Block from './ui/Block'

const ProfileMenu = (
    props: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>
) => {
    const { onClick, className, ...other } = props
    const [open, setOpen] = useState<boolean>(false)
    const ref = useRef<HTMLDivElement>()
    const { push } = useRouter()
    const { user: authUser } = useAuth()
    const user = useStageSelector((state) => state.globals.localUser)

    useEffect(() => {
        if (ref.current) {
            const target = ref.current
            if (open) {
                disableBodyScroll(target)
                return () => {
                    enableBodyScroll(target)
                }
            }
        }
    }, [ref, open])

    return (
        <div className={styles.wrapper}>
            <SecondaryButton
                round
                toggled={!open}
                className={`${styles.button} ${className || ''}`}
                onClick={(e) => {
                    setOpen((prev) => !prev)
                    if (onClick) onClick(e)
                }}
                {...other}
            >
                <FaUser />
            </SecondaryButton>
            {open && (
                <>
                    <div className={styles.backdrop} onClick={() => setOpen(false)} />
                    <div className={styles.menuPanel} ref={ref}>
                        {user && (
                            <>
                                <Paragraph kind="micro">Angemeldet als</Paragraph>
                                <h5>{user?.name}</h5>
                                <Paragraph kind="micro">{authUser?.email}</Paragraph>
                                <hr />
                                <Block vertical paddingTop={2} paddingBottom={4}>
                                    <Link href="/account/profile">
                                        <a
                                            className={styles.profileButton}
                                            onClick={() => setOpen(false)}
                                        >
                                            Profil bearbeiten
                                        </a>
                                    </Link>
                                </Block>
                                <DangerButton onClick={() => push('/account/logout')}>
                                    Logout
                                </DangerButton>
                            </>
                        )}
                    </div>
                </>
            )}
        </div>
    )
}
export default ProfileMenu

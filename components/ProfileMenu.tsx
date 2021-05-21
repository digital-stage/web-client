import { disableBodyScroll, enableBodyScroll } from 'body-scroll-lock'
import React, { useEffect, useRef, useState } from 'react'
import { FaUser } from 'react-icons/fa'
import { useRouter } from 'next/router'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import Link from 'next/link'
import styles from './ProfileMenu.module.css'
import { DangerButton, SecondaryButton } from './ui/Button'

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
                className={`${styles.button} ${className}`}
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
                        {!user && (
                            <>
                                <p className="micro">Angemeldet als</p>
                                <p className="micro">
                                    <strong>{user?.name}</strong>
                                </p>
                                <p className="micro">{authUser?.email}</p>
                                <p className="micro">
                                    <hr />
                                    <Link href="/account/profile">
                                        <a className={styles.profileButton}>Profil bearbeiten</a>
                                    </Link>
                                </p>
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

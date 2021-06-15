import Link from 'next/link'
import React, { useState } from 'react'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import { FaUser } from 'react-icons/fa'
import styles from './ProfileMenu.module.css'
import OverlayMenu from '../../ui/nav/OverlayMenu'
import Paragraph from '../../components/ui/Paragraph'
import Block from '../../components/ui/Block'
import { DangerButton, SecondaryButton } from '../../ui/Button'

const ProfileMenu = () => {
    const [open, setOpen] = useState<boolean>(false)
    const { user: authUser } = useAuth()
    const user = useStageSelector((state) => state.globals.localUser)

    if (authUser) {
        return (
            <OverlayMenu
                open={open}
                onClose={() => setOpen(false)}
                className={styles.icon}
                menu={
                    <>
                        <Paragraph kind="micro">Angemeldet als</Paragraph>
                        <h5>{user?.name}</h5>
                        <Paragraph kind="micro">{authUser?.email}</Paragraph>
                        <hr />
                        <Block vertical paddingTop={2} paddingBottom={4}>
                            <Link href="/account/profile">
                                <a className={styles.profileButton} onClick={() => setOpen(false)}>
                                    Profil bearbeiten
                                </a>
                            </Link>
                        </Block>
                        <Link href="/account/logout">
                            <DangerButton>Logout</DangerButton>
                        </Link>
                    </>
                }
            >
                <SecondaryButton
                    round
                    toggled={!open}
                    onClick={() => {
                        setOpen((prev) => !prev)
                    }}
                >
                    <FaUser />
                </SecondaryButton>
            </OverlayMenu>
        )
    }
    return null
}

export default ProfileMenu

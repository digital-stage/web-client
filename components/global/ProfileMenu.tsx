import Link from 'next/link'
import React, { useState } from 'react'
import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import { FaUser } from 'react-icons/fa'
import { User } from '@digitalstage/api-types'
import styles from './ProfileMenu.module.css'
import OverlayMenu from '../../fastui/components/nav/OverlayMenu'
import { DangerButton, SecondaryButton } from '../../fastui/components/interaction/Button'
import TextLink from '../../fastui/components/interaction/TextLink'

const ProfileMenu = () => {
    const [open, setOpen] = useState<boolean>(false)
    const { user: authUser } = useAuth()
    const user = useStageSelector<User | undefined>((state) =>
        state.globals.localUserId ? state.users.byId[state.globals.localUserId] : undefined
    )

    if (authUser) {
        return (
            <OverlayMenu
                open={open}
                onClose={() => setOpen(false)}
                className={styles.icon}
                menu={
                    <>
                        <p className="micro">Angemeldet als</p>
                        <h5>{user?.name}</h5>
                        <p className="micro">{authUser?.email}</p>
                        <hr />
                        <Link href="/account/profile">
                            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
                            <TextLink
                                className={styles.profileButton}
                                onClick={() => setOpen(false)}
                            >
                                Profil bearbeiten
                            </TextLink>
                        </Link>
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
                    size="small"
                >
                    <FaUser />
                </SecondaryButton>
            </OverlayMenu>
        )
    }
    return null
}

export default ProfileMenu

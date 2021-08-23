import { useRouter } from 'next/router'
import React, { useState } from 'react'
import useOpenState from '../../ui/useOpenState'
import Backdrop from '../../ui/Backdrop'
import styles from './Sidebar.module.scss'
import Image from 'next/image'
import logo from '../../public/logo.svg'
import Link from 'next/link'
import { useStageSelector } from '@digitalstage/api-client-react'
import { GoBroadcast, GoListUnordered, GoSettings } from 'react-icons/go'
import { BiChat, BiCube, BiDevices } from 'react-icons/bi'
import { FaBug, FaTools } from 'react-icons/fa'
import { MdMoreHoriz } from 'react-icons/md'
import { IoIosNotifications } from 'react-icons/io'

const SidebarItem = ({
    children,
    href,
    onClick,
}: {
    children: React.ReactNode
    href: string
    onClick?: () => void
}) => {
    const { pathname } = useRouter()
    return (
        <Link href={href}>
            <a
                className={`${styles.sidebarItem} ${pathname === href ? styles.selected : ''}`}
                onClick={onClick}
            >
                {children}
            </a>
        </Link>
    )
}

const Sidebar = () => {
    const [open, setOpen] = useState<boolean>(false)
    const openState = useOpenState(open)
    const signedIn = useStageSelector<boolean>((state) => !!state.auth.token)
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const deviceCount = useStageSelector<number>((state) => state.devices.allIds.length)
    const hasNotifications = useStageSelector<boolean>(
        (state) => state.notifications.allIds.length > 0
    )

    return (
        <>
            {openState !== 'closed' ? (
                <Backdrop
                    className={styles.sidebarBackdrop}
                    open={openState}
                    onClick={() => setOpen(false)}
                />
            ) : null}
            {signedIn ? (
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className={`secondary round ${styles.sidebarBurgerButton}`}
                >
                    <MdMoreHoriz />
                </button>
            ) : null}
            <div
                className={`${styles.sidebar} ${!signedIn ? styles.hidden : ''} ${
                    open ? styles.sidebarOpen : ''
                }`}
            >
                <div className={styles.sidebarContent}>
                    <div className={styles.sidebarHeader}>
                        <Image width="38" height="38" src={logo} alt="Digital Stage" />
                    </div>
                    <div className={styles.sidebarSpacer} />
                    <div className={styles.sidebarBody}>
                        {insideStage ? (
                            <>
                                <SidebarItem onClick={() => setOpen(false)} href="/stage">
                                    <GoBroadcast />
                                    <span>Stage</span>
                                </SidebarItem>
                                <SidebarItem onClick={() => setOpen(false)} href="/mixer">
                                    <GoSettings />
                                    <span>Mischpult</span>
                                </SidebarItem>
                                <SidebarItem onClick={() => setOpen(false)} href="/room">
                                    <BiCube />
                                    <span>3D Audio</span>
                                </SidebarItem>
                                <SidebarItem onClick={() => setOpen(false)} href="/chat">
                                    <BiChat />
                                    <span>Chat</span>
                                </SidebarItem>
                            </>
                        ) : null}
                        {deviceCount > 1 ? (
                            <SidebarItem onClick={() => setOpen(false)}  href="/devices">
                                <BiDevices />
                                <span>Geräte</span>
                            </SidebarItem>
                        ) : undefined}
                        <SidebarItem onClick={() => setOpen(false)}  href="/settings/device">
                            <FaTools />
                            <span>Einstellungen</span>
                        </SidebarItem>
                        <SidebarItem onClick={() => setOpen(false)}  href="/stages">
                            <GoListUnordered />
                            <span>Bühnen</span>
                        </SidebarItem>
                    </div>
                    <div className={styles.sidebarSpacer} />
                    <div className={styles.sidebarFooter}>
                        {hasNotifications ? (
                            <SidebarItem onClick={() => setOpen(false)} href="/notifications">
                                <IoIosNotifications />
                                <span>Ereignisse</span>
                            </SidebarItem>
                        ) : null}
                        <Link href="https://forum.digital-stage.org/c/deutsch/ds-web/30">
                            <a target="_blank" className={styles.sidebarItem}>
                                <FaBug />
                                <span>Feedback</span>
                            </a>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Sidebar

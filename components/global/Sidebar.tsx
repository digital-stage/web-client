import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
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

const Sidebar = () => {
    const { events, pathname } = useRouter()
    const [open, setOpen] = useState<boolean>(false)
    const openState = useOpenState(open)
    const signedIn = useStageSelector((state) => !!state.auth.token)
    const insideStage = useStageSelector((state) => !!state.globals.stageId)
    const deviceCount = useStageSelector((state) => state.devices.allIds.length)
    const numNotifications = useStageSelector((state) => state.notifications.allIds.length)

    useEffect(() => {
        if (events) {
            const handler = () => setOpen(false)
            events.on('routeChangeStart', handler)
            return () => {
                events.off('routeChangeStart', handler)
            }
        }
    }, [events])

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
                                <Link href="/stage">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/stage' ? styles.selected : ''
                                        }`}
                                    >
                                        <GoBroadcast />
                                        <span>Stage</span>
                                    </a>
                                </Link>
                                <Link href="/mixer">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/mixer' ? styles.selected : ''
                                        }`}
                                    >
                                        <GoSettings />
                                        <span>Mischpult</span>
                                    </a>
                                </Link>
                                <Link href="/room">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/room' ? styles.selected : ''
                                        }`}
                                    >
                                        <BiCube />
                                        <span>3D Audio</span>
                                    </a>
                                </Link>
                                <Link href="/chat">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/chat' ? styles.selected : ''
                                        }`}
                                    >
                                        <BiChat />
                                        <span>Chat</span>
                                    </a>
                                </Link>
                            </>
                        ) : null}
                        {deviceCount > 1 ? (
                            <Link href="/devices">
                                <a
                                    className={`${styles.sidebarItem} ${
                                        pathname.startsWith('/devices') ? styles.selected : ''
                                    }`}
                                >
                                    <BiDevices />
                                    <span>Geräte</span>
                                </a>
                            </Link>
                        ) : undefined}
                        <Link href="/settings/device">
                            <a
                                className={`${styles.sidebarItem} ${
                                    pathname.startsWith('/settings') ? styles.selected : ''
                                }`}
                            >
                                <FaTools />
                                <span>Einstellungen</span>
                            </a>
                        </Link>
                        <Link href="/stages">
                            <a
                                className={`${styles.sidebarItem} ${
                                    pathname.startsWith('/stages') ? styles.selected : ''
                                }`}
                            >
                                <GoListUnordered />
                                <span>Bühnen</span>
                            </a>
                        </Link>
                    </div>
                    <div className={styles.sidebarSpacer} />
                    <div className={styles.sidebarFooter}>
                        {numNotifications > 0 ? (
                            <Link href="/notifications">
                                <a
                                    className={`${styles.sidebarItem} ${
                                        pathname === '/notifications' ? styles.selected : ''
                                    }`}
                                >
                                    <IoIosNotifications />
                                    <span>Ereignisse</span>
                                </a>
                            </Link>
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

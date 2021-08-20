import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'
import useOpenState from '../../ui/useOpenState'
import Backdrop from '../../ui/Backdrop'
import styles from './Sidebar.module.scss'
import Image from 'next/image'
import logo from '../../public/logo.svg'
import Link from 'next/link'
import { useStageSelector } from '@digitalstage/api-client-react'

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
                    <Image layout="fill" src="/icons/burger.svg" alt="Menü öffnen" />
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
                                        <Image
                                            layout="fill"
                                            src="/icons/stage.svg"
                                            alt="Aktuelle Bühne"
                                        />
                                        <span>Stage</span>
                                    </a>
                                </Link>
                                <Link href="/mixer">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/mixer' ? styles.selected : ''
                                        }`}
                                    >
                                        <Image
                                            layout="fill"
                                            src="/icons/settings.svg"
                                            alt="Mischpult"
                                        />
                                        <span>Mischpult</span>
                                    </a>
                                </Link>
                                <Link href="/room">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/room' ? styles.selected : ''
                                        }`}
                                    >
                                        <Image
                                            layout="fill"
                                            src="/icons/3daudio.svg"
                                            alt="3D Audio"
                                        />
                                        <span>3D Adio</span>
                                    </a>
                                </Link>
                                <Link href="/chat">
                                    <a
                                        className={`${styles.sidebarItem} ${
                                            pathname === '/chat' ? styles.selected : ''
                                        }`}
                                    >
                                        <Image layout="fill" src="/icons/chat.svg" alt="3D Audio" />
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
                                    <Image layout="fill" src="/icons/devices.svg" alt="Geräte" />
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
                                <Image
                                    layout="fill"
                                    src="/icons/settings.svg"
                                    alt="Einstellungen"
                                />
                                <span>Einstellungen</span>
                            </a>
                        </Link>
                        <Link href="/stages">
                            <a
                                className={`${styles.sidebarItem} ${
                                    pathname.startsWith('/stages') ? styles.selected : ''
                                }`}
                            >
                                <Image layout="fill" src="/icons/stages.svg" alt="Meine Bühnen" />
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
                                    <Image
                                        layout="fill"
                                        src="/icons/notification.svg"
                                        alt="Ereignisse"
                                    />
                                    <span>Ereignisse</span>
                                </a>
                            </Link>
                        ) : null}
                        <Link href="https://forum.digital-stage.org/c/deutsch/ds-web/30">
                            <a target="_blank" className={styles.sidebarItem}>
                                <Image layout="fill" src="/icons/bug.svg" alt="Feedback" />
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

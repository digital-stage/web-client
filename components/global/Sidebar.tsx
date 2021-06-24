import Image from 'next/image'
import { useStageSelector } from '@digitalstage/api-client-react'
import React, { useState } from 'react'
import Link from 'next/link'
import { GoBroadcast, GoListUnordered, GoSettings } from 'react-icons/go'
import { BiChat, BiCube, BiDevices } from 'react-icons/bi'
import { FaBug, FaTools } from 'react-icons/fa'
import { useRouter } from 'next/router'
import Button from 'fastui/components/interaction/Button'
import Backdrop from 'fastui/components/Backdrop'
import styles from './Sidebar.module.css'
import useOpenState from '../../fastui/hooks/useOpenState'

const SidebarItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const { pathname } = useRouter()
    return (
        <Link href={href}>
            <a className={`${styles.sidebarItem} ${pathname === href ? styles.active : ''}`}>
                {children}
            </a>
        </Link>
    )
}

const Sidebar = () => {
    const deviceCount = useStageSelector((state) => state.devices.allIds.length)
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const [collapsed, setCollapsed] = useState<boolean>(false)
    const openState = useOpenState(collapsed)
    return (
        <>
            {openState !== 'closed' && (
                <Backdrop open={openState} onClick={() => setCollapsed(false)} />
            )}
            <div className={`${styles.sidebar} ${collapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarTop}>
                    <div className={styles.sidebarLogo}>
                        <Image width={40} height={40} src="/static/logo.svg" />
                    </div>
                </div>
                <div className={styles.sidebarSpacer} />
                <div className={styles.sidebarCenter}>
                    {insideStage && (
                        <>
                            <SidebarItem href="/stage">
                                <GoBroadcast name="Stage" />
                                Stage
                            </SidebarItem>
                            <SidebarItem href="/mixer">
                                <GoSettings name="Mixer" />
                                Mixer
                            </SidebarItem>
                            <SidebarItem href="/room">
                                <BiCube name="Room" />
                                3D Audio
                            </SidebarItem>
                            <SidebarItem href="/chat">
                                <BiChat name="Chat" />
                                Chat
                            </SidebarItem>
                        </>
                    )}
                    {deviceCount > 1 ? (
                        <SidebarItem href="/devices">
                            <BiDevices size={18} name="Meine Geräte" />
                            Meine Geräte
                        </SidebarItem>
                    ) : undefined}
                    <SidebarItem href="/settings/device">
                        <FaTools size={18} name="Einstellungen" />
                        Einstellungen
                    </SidebarItem>
                    <SidebarItem href="/stages">
                        <GoListUnordered size={18} name="Stages" />
                        Bühnen
                    </SidebarItem>
                </div>
                <div className={styles.sidebarSpacer} />
                <div className={styles.sidebarBottom}>
                    <SidebarItem href="/debug">
                        <FaBug name="Feedback" />
                        DEBUG
                    </SidebarItem>
                    <Link href="https://forum.digital-stage.org/c/deutsch/ds-web/30">
                        <a target="_blank">
                            <FaBug name="Feedback" />
                            Feedback
                        </a>
                    </Link>
                </div>
            </div>
            <div className={styles.burgerButton}>
                <Button onClick={() => setCollapsed((prev) => !prev)}>B</Button>
            </div>
        </>
    )
}
export default Sidebar

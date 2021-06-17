import Image from 'next/image'
import { useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import Link from 'next/link'
import { GoBroadcast, GoListUnordered, GoSettings } from 'react-icons/go'
import { BiChat, BiCube } from 'react-icons/bi'
import { FaBug, FaTools } from 'react-icons/fa'
import { useRouter } from 'next/router'
import styles from './Sidebar.module.scss'

const SidebarItem = ({ href, children }: { href: string; children: React.ReactNode }) => {
    const { pathname } = useRouter()
    return (
        <Link href={href}>
            <a className={pathname === href ? styles.active : ''}>{children}</a>
        </Link>
    )
}

const Sidebar = () => {
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    return (
        <div className={styles.sidebar}>
            <div className={styles.top}>
                <div className={styles.logo}>
                    <Image width={40} height={40} src="/static/logo.svg" />
                </div>
            </div>
            <div className={styles.spacer} />
            <div className={styles.center}>
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
                <SidebarItem href="/devices">
                    <FaTools size={18} name="Devices" />
                    Einstellungen
                </SidebarItem>
                <SidebarItem href="/stages">
                    <GoListUnordered size={18} name="Stages" />
                    Bühnen
                </SidebarItem>
            </div>
            <div className={styles.spacer} />
            <div className={styles.bottom}>
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
    )
}
export default Sidebar

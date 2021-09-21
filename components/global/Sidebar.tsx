/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useOpenState } from 'ui/useOpenState'
import { Backdrop } from 'ui/Backdrop'
import Image from 'next/image'
import logo from '../../public/logo.svg'
import Link from 'next/link'
import { useSpatialAudioSelector, useStageSelector } from '@digitalstage/api-client-react'
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
                className={`sidebarItem ${pathname === href ? 'selected' : ''}`}
                onClick={onClick}
            >
                {children}
            </a>
        </Link>
    )
}

const Sidebar = () => {
    const [open, setOpen] = React.useState<boolean>(false)
    const openState = useOpenState(open)
    const signedIn = useStageSelector<boolean>((state) => !!state.auth.token)
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const deviceCount = useStageSelector<number>((state) => state.devices.allIds.length)
    const hasNotifications = useStageSelector<boolean>(
        (state) => state.notifications.allIds.length > 0
    )
    const renderSpatialAudio = useSpatialAudioSelector()

    return (
        <>
            {openState !== 'closed' ? (
                <Backdrop
                    className="sidebarBackdrop"
                    open={openState}
                    onClick={() => setOpen(false)}
                />
            ) : null}
            {signedIn ? (
                <button
                    onClick={() => setOpen((prev) => !prev)}
                    className={`secondary round sidebarBurgerButton`}
                >
                    <MdMoreHoriz />
                </button>
            ) : null}
            <div
                className={`sidebar ${!signedIn ? 'hidden' : ''} ${
                    open ? 'sidebarOpen' : ''
                }`}
            >
                <div className="sidebarContent">
                    <div className="sidebarHeader">
                        <Image width="38" height="38" src={logo} alt="Digital Stage" />
                    </div>
                    <div className="sidebarSpacer" />
                    <div className="sidebarBody">
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
                                {renderSpatialAudio ? (
                                    <SidebarItem onClick={() => setOpen(false)} href="/room">
                                        <BiCube />
                                        <span>3D Audio</span>
                                    </SidebarItem>
                                ) : null}
                                <SidebarItem onClick={() => setOpen(false)} href="/chat">
                                    <BiChat />
                                    <span>Chat</span>
                                </SidebarItem>
                            </>
                        ) : null}
                        {deviceCount > 1 ? (
                            <SidebarItem onClick={() => setOpen(false)} href="/devices">
                                <BiDevices />
                                <span>Geräte</span>
                            </SidebarItem>
                        ) : undefined}
                        <SidebarItem onClick={() => setOpen(false)} href="/settings/device">
                            <FaTools />
                            <span>Einstellungen</span>
                        </SidebarItem>
                        <SidebarItem onClick={() => setOpen(false)} href="/stages">
                            <GoListUnordered />
                            <span>Bühnen</span>
                        </SidebarItem>
                        {process.env.NODE_ENV !== "production" && (
                            <SidebarItem onClick={() => setOpen(false)} href="/test">
                                T
                                <span>TEST</span>
                            </SidebarItem>
                        )}
                    </div>
                    <div className="sidebarSpacer" />
                    <div className="sidebarFooter">
                        {hasNotifications ? (
                            <SidebarItem onClick={() => setOpen(false)} href="/notifications">
                                <IoIosNotifications />
                                <span>Ereignisse</span>
                            </SidebarItem>
                        ) : null}
                        <Link href="https://forum.digital-stage.org/c/deutsch/ds-web/30">
                            <a target="_blank" className="sidebarItem">
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

const MemoizedSidebar = React.memo(Sidebar)

export { MemoizedSidebar as Sidebar }

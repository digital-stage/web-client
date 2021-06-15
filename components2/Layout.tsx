import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import styles from './Layout.module.scss'
import Sidebar from '../components/Sidebar'
import Background from '../ui/Background'
import MobileMenu from '../components/MobileMenu'
import { NotificationPanel } from './NotificationCenter'
import ProfileMenu from './global/ProfileMenu'

const Layout = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth()
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    return (
        <div className={`${styles.layout} ${insideStage && styles.insideStage}`}>
            <Background insideStage={insideStage} />
            {!loading && user && (
                <div className={styles.sidebar}>
                    <div className={styles.fixedSidebar}>
                        <Sidebar />
                    </div>
                </div>
            )}
            <div className={styles.content}>
                {children}
                <NotificationPanel />
            </div>
            {!loading && user && <ProfileMenu />}
            {insideStage && <MobileMenu />}
        </div>
    )
}
export default Layout

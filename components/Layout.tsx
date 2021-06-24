import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import styles from './Layout.module.css'
import Sidebar from './global/Sidebar'
import Background from '../fastui/components/Background'
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
        </div>
    )
}
export default Layout

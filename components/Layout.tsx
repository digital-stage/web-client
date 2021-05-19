import { useAuth, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import styles from './Layout.module.scss'
import Sidebar from './Sidebar'
import Background from './ui/Background'

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
            <div className={styles.content}>{children}</div>
        </div>
    )
}
export default Layout

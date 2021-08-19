import { useStageSelector } from '@digitalstage/api-client-react'
import styles from './ConnectionOverlay.module.scss'
import React from 'react'
import LoadingShaft from '../../ui/LoadingShaft'

const ConnectionOverlay = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const connected = useStageSelector((state) => state.globals.ready)

    if (signedIn && !connected) {
        return (
            <div className={styles.overlay}>
                <LoadingShaft />
                <h2>Verbinde ...</h2>
            </div>
        )
    }
    return <>{children}</>
}
export default ConnectionOverlay

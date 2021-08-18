import { useStageSelector } from '@digitalstage/api-client-react'
import styles from './ConnectionOverlay.module.scss'

const ConnectionOverlay = () => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const connected = useStageSelector((state) => state.globals.ready)

    if (signedIn && !connected) {
        return <div className={styles.overlay}>Verbinde ...</div>
    }
    return null
}
export default ConnectionOverlay

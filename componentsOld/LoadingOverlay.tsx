import { ReactNode } from 'react'
import styles from './LoadingOverlay.module.scss'

const LoadingOverlay = ({ children }: { children: ReactNode }) => (
    <div className={styles.overlay}>{children}</div>
)
export default LoadingOverlay

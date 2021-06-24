import { ReactNode } from 'react'
import styles from './LoadingOverlay.module.css'

const LoadingOverlay = ({ children }: { children: ReactNode }) => (
    <div className={styles.overlay}>{children}</div>
)
export default LoadingOverlay

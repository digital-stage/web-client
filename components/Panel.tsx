import React from 'react'
import styles from './Panel.module.scss'

const Panel = ({ children }: { children: React.ReactNode }) => {
    return <div className={styles.panel}>{children}</div>
}
export default Panel

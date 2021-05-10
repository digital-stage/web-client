import Link from 'next/link'
import React from 'react'
import styles from './NavigationBar.module.css'

const NavigationBar = () => {
    return (
        <div className={styles.wrapper}>
            <div className={styles.item}>
                <Link href="/stage">STAGE</Link>
            </div>
            <div className={styles.item}>
                <Link href="/devices">DEVICES</Link>
            </div>
            <div className={styles.item}>
                <Link href="/stages">STAGES</Link>
            </div>
            <div className={styles.item}>
                <Link href="/debug">DEBUG</Link>
            </div>
        </div>
    )
}
export default NavigationBar

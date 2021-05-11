import React from 'react'
import styles from './LoadingOverlay.module.css'

const LoadingOverlay = (props: { children: React.ReactNode }) => {
    const { children } = props
    return (
        <div className={styles.wrapper}>
            <img className={styles.img} alt="Loading..." src="/static/logo.svg" />
            {children}
        </div>
    )
}
export default LoadingOverlay

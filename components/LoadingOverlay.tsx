import React from 'react'
import styles from './LoadingOverlay.module.css'
import Image from 'next/image'

const LoadingOverlay = (props: { children: React.ReactNode }) => {
    const { children } = props
    return (
        <div className={styles.wrapper}>
            <Image width={200} height={200} alt="Loading..." src="/static/logo.svg" />
            {children}
        </div>
    )
}
export default LoadingOverlay

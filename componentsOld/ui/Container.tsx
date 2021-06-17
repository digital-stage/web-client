import React from 'react'
import styles from './Container.module.css'

export interface WIDTH {
    narrow: 'narrow'
    wide: 'wide'
}

const Container = ({
    children,
    width,
}: {
    children: React.ReactNode
    width?: WIDTH[keyof WIDTH]
}) => {
    return <div className={`${styles.container} ${width ? styles[width] : ''}`}>{children}</div>
}
Container.defaultProps = {
    width: 'wide',
}
export default Container

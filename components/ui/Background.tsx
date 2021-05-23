import React from 'react'
import styles from './Background.module.css'

const Background = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        insideStage?: boolean
    }
) => {
    const { insideStage, className, ...other } = props
    return (
        <div
            className={`${styles.background} ${insideStage ? styles.active : ''} ${
                className || ''
            }`}
            {...other}
        />
    )
}

export default Background

/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import styles from './Panel.module.css'

export interface LEVEL {
    Level1: 'level1'
    Level2: 'level2'
    Level3: 'level3'
    Level4: 'level4'
    Level5: 'level5'
}

const Panel = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
        level?: LEVEL[keyof LEVEL]
        fill?: boolean
    }
) => {
    const { level, fill, className, children, ...other } = props
    let levelStyle = styles.level1
    switch (level) {
        case 'level2': {
            levelStyle = styles.level2
            break
        }
        case 'level3': {
            levelStyle = styles.level3
            break
        }
        case 'level4': {
            levelStyle = styles.level4
            break
        }
        case 'level5': {
            levelStyle = `${styles.level5} light`
            break
        }
        default: {
            break
        }
    }
    return (
        <div
            className={`${styles.panel} ${fill ? styles.fill : ''} ${levelStyle} ${
                className || ''
            }`}
            {...other}
        >
            {children}
        </div>
    )
}
Panel.defaultProps = {
    level: undefined,
    fill: undefined,
}
export default Panel

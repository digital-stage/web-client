/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import Block from './Block'
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
        padding?: number | number[]
    }
) => {
    const { level, fill, className, children, padding, ...other } = props
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
            levelStyle = styles.level5
            break
        }
        default: {
            break
        }
    }
    return (
        <div
            className={`${styles.panel} ${fill ? styles.fill : ''} ${levelStyle} ${className}`}
            {...other}
        >
            <Block vertical width="full" padding={padding !== undefined ? padding : 4}>
                {children}
            </Block>
        </div>
    )
}
Panel.defaultProps = {
    level: undefined,
    fill: undefined,
    padding: undefined,
}
export default Panel

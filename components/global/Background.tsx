/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import styles from './Background.module.css'
import { useStageSelector } from '@digitalstage/api-client-react'

const Background = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const { className, ...other } = props
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

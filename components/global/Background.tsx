/* eslint-disable react/jsx-props-no-spreading */
import React from 'react'
import { useStageSelector } from '@digitalstage/api-client-react'

const Background = (
    props: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
) => {
    const insideStage = useStageSelector<boolean>((state) => !!state.globals.stageId)
    const { className, ...other } = props
    return (
        <div
            className={`background ${insideStage ? 'active' : ''} ${
                className || ''
            }`}
            {...other}
        />
    )
}
export { Background }

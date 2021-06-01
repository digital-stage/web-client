import React from 'react'
import { FaPlay } from 'react-icons/fa'

import { useAuth } from '@digitalstage/api-client-react'
import styles from './PlaybackOverlay.module.css'
import useAudioContext from '../hooks/useAudioContext'

const PlaybackOverlay = (): JSX.Element => {
    const { user } = useAuth()
    const { started, start } = useAudioContext()

    if (user && !started) {
        return (
            <div onClick={start} className={styles.overlay}>
                <FaPlay size="128px" name="Start" />
            </div>
        )
    }
    return null
}
export default PlaybackOverlay

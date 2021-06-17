import React from 'react'
import { FaPlay } from 'react-icons/fa'

import { useAudioContext, useAuth } from '@digitalstage/api-client-react'
import styles from './PlaybackOverlay.module.css'

const PlaybackOverlay = (): JSX.Element => {
    const { user } = useAuth()
    const { started, start } = useAudioContext()

    if (user && !started) {
        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div role="button" tabIndex={0} onClick={start} className={styles.overlay}>
                <FaPlay size="128px" name="Start" />
            </div>
        )
    }
    return null
}
export default PlaybackOverlay

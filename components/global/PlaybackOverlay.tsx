import React from 'react'

import styles from './PlaybackOverlay.module.css'
import { useStageSelector } from '@digitalstage/api-client-react'
import useAudioContext from '../../api/hooks/useAudioContext'
import { FaPlay } from 'react-icons/fa'

const PlaybackOverlay = (): JSX.Element | null => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const started = useStageSelector<boolean>((state) => state.globals.audioStarted)
    const { start } = useAudioContext()

    if (signedIn && !started && start) {
        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div role="button" tabIndex={0} onClick={start} className={styles.overlay}>
                <FaPlay />
            </div>
        )
    }
    return null
}
export default PlaybackOverlay

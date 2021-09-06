import React from 'react'

import {
    useAudioContext,
    useAudioContextDispatch,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { FaPlay } from 'react-icons/fa'

const PlaybackOverlay = (): JSX.Element | null => {
    const signedIn = useStageSelector((state) => state.auth.initialized && !!state.auth.token)
    const { running } = useAudioContext()
    const dispatch = useAudioContextDispatch()

    if (signedIn && !running && dispatch) {
        return (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events
            <div
                role="button"
                tabIndex={0}
                onClick={() => dispatch({ type: 'start', dispatch })}
                className="topoverlay"
            >
                <FaPlay />
            </div>
        )
    }
    return null
}
export { PlaybackOverlay }

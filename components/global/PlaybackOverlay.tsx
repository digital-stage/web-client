/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import React from 'react'

import {
    selectSignedIn,
    useAudioContext,
    useAudioContextDispatch,
    useTrackedSelector,
} from '../../client'
import { FaPlay } from 'react-icons/fa'

const PlaybackOverlay = (): JSX.Element | null => {
    const state = useTrackedSelector()
    const signedIn = selectSignedIn(state)
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

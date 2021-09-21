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
import {GoMirror} from 'react-icons/go'

const UnmemorizedVideoPlayer = ({track, className}: { track: MediaStreamTrack; className?: string }) => {
    const [mirrored, setMirrored] = React.useState<boolean>(false)
    const landscape = React.useMemo<boolean>(() => {
        const settings = track.getSettings()
        if (settings.aspectRatio) return settings.aspectRatio >= 1
        return true
    }, [track])
    const videoRef = React.useRef<HTMLVideoElement>(null)

    React.useEffect(() => {
        if (track && videoRef.current) {
            videoRef.current.srcObject = new MediaStream([track])
        }
    }, [track, videoRef])

    return (
        <div
            className={`videoView ${mirrored ? 'mirrored' : ''} ${
                landscape ? 'landscape' : 'portrait'
            } ${className || ''}`}
        >
                <video autoPlay muted playsInline controls={false} ref={videoRef}/>
                <button
                    onClick={() => setMirrored((prev) => !prev)}
                    className={`small round white mirrorToggle`}
                >
                    <GoMirror/>
                </button>
        </div>
    )
}

const VideoPlayer = React.memo(UnmemorizedVideoPlayer)

export {VideoPlayer}

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

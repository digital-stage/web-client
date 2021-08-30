import React from 'react'
import { GoMirror } from 'react-icons/go'
import styles from './StageView.module.scss'

const VideoView = ({ track, className }: { track: MediaStreamTrack; className?: string }) => {
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
            className={`${styles.videoView} ${mirrored ? styles.mirrored : ''} ${
                landscape ? styles.landscape : styles.portrait
            } ${className || ''}`}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <video autoPlay muted playsInline controls={false} ref={videoRef} />
            <button
                onClick={() => setMirrored((prev) => !prev)}
                className={`small round white ${styles.mirrorToggle}`}
            >
                <GoMirror />
            </button>
        </div>
    )
}

export { VideoView }

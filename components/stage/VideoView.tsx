import React, { useEffect, useMemo, useRef, useState } from 'react'
import { GoMirror } from 'ui/Icons'
import styles from './StageView.module.scss'

const VideoView = ({ track, className }: { track: MediaStreamTrack; className?: string }) => {
    const [mirrored, setMirrored] = useState<boolean>(false)
    const landscape = useMemo<boolean>(() => {
        const settings = track.getSettings()
        if (settings.aspectRatio) return settings.aspectRatio >= 1
        return true
    }, [track])
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
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

export default VideoView

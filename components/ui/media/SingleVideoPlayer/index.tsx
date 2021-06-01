import * as React from 'react'
import { useEffect, useRef } from 'react'

const SingleVideoPlayer = (props: {
    track: MediaStreamTrack
    width: string
    height: string
    mirrored?: boolean
}) => {
    const { track, width, height, mirrored } = props
    const ref = useRef<HTMLVideoElement>()

    useEffect(() => {
        if (ref && ref.current) {
            ref.current.srcObject = new MediaStream([track])
        }
    }, [ref, track])

    return (
        <>
            <video muted playsInline autoPlay ref={ref} />
            <style jsx>{`
        video {
          background-color: black;
          width: ${width};
          height: ${height};
          object-fit: 'cover';
          ${mirrored && 'transform: scale(-1, 1);'}
      `}</style>
        </>
    )
}

export default SingleVideoPlayer

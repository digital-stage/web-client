import React, { useRef } from 'react'

const ConsumerRenderer = () => {
    const audioRef = useRef<HTMLAudioElement>()

    //

    return (
        <audio ref={audioRef}>
            <track kind="captions" />
        </audio>
    )
}

export default ConsumerRenderer

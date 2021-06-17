import React, { useEffect, useRef } from 'react'
import { useAuth, useMediasoup } from '@digitalstage/api-client-react'
import { useRouter } from 'next/router'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import Container from '../componentsOld/ui/Container'

const SingleVideoTrackPlayer = ({ consumer }: { consumer: Consumer }) => {
    const videoRef = useRef<HTMLVideoElement>()

    useEffect(() => {
        if (consumer && videoRef.current) {
            const { track } = consumer
            videoRef.current.srcObject = new MediaStream([track])
        }
    }, [consumer, videoRef])

    return <video autoPlay muted playsInline controls={false} ref={videoRef} />
}

const Stage = () => {
    const { loading, user } = useAuth()
    const { replace } = useRouter()
    useEffect(() => {
        if (!loading && !user && replace) {
            replace('/account/login')
        }
    }, [loading, user, replace])
    const { videoConsumers } = useMediasoup()

    return (
        <Container>
            {Object.keys(videoConsumers).map((id) => (
                <SingleVideoTrackPlayer consumer={videoConsumers[id]} />
            ))}
        </Container>
    )
}
export default Stage

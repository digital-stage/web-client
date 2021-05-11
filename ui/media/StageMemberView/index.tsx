import { StageMember, useMediasoup, User, useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect, useRef } from 'react'
import styles from './StageMemberView.module.css'

const SingleVideoTrackPlayer = (props: { id: string }) => {
    const { id } = props
    const videoRef = useRef<HTMLVideoElement>()
    const { videoConsumers } = useMediasoup()

    useEffect(() => {
        if (videoConsumers && videoRef.current) {
            const { track } = videoConsumers[id]
            videoRef.current.srcObject = new MediaStream([track])
        }
    }, [id, videoConsumers, videoRef])

    return (
        <video
            className={styles.video}
            autoPlay
            muted
            playsInline
            controls={false}
            ref={videoRef}
        />
    )
}

const MultiVideoTrackPlayer = (props: { ids: string[] }) => {
    const { ids } = props

    // TODO: Distribute videos
    return (
        <>
            {ids.map((id) => (
                <SingleVideoTrackPlayer id={id} />
            ))}
        </>
    )
}

const StageMemberView = (props: { id: string }) => {
    const { id } = props
    const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
    const remoteUser = useStageSelector<User>((state) => state.remoteUsers.byId[stageMember.userId])

    const videoTrackIds = useStageSelector<string[]>(
        (state) => state.videoTracks.byStageMember[id] || []
    )

    return (
        <div className={styles.wrapper}>
            <div className={styles.inner}>
                <div className={styles.banner}>{remoteUser.name}</div>
            </div>
        </div>
    )
}
export default StageMemberView

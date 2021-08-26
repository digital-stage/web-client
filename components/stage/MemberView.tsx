import React, { useMemo } from 'react'
import styles from './StageView.module.scss'
import VideoView from './VideoView'
import Avatar from './Avatar'
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, VideoTrack } from '@digitalstage/api-types'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'
import { useVideoConsumers, useVideoProducers } from '../../api/services/MediasoupService'
import debug from 'debug'

const report = debug('MemberView')

const MemberView = ({
    memberId,
    groupColor,
    groupName,
    hasAdminRights,
}: {
    memberId: string
    groupColor?: string
    groupName?: string
    hasAdminRights?: boolean
}) => {
    report('RENDER')
    const member = useStageSelector((state) => state.stageMembers.byId[memberId])
    const user = useStageSelector((state) => (member ? state.users.byId[member.userId] : undefined))
    const videoTracks = useStageSelector(
        (state) =>
            state.videoTracks.byStageMember[memberId]?.map((id) => state.videoTracks.byId[id]) || []
    )
    const videoConsumers = useVideoConsumers()
    const videoProducers = useVideoProducers()
    const emit = useEmit()

    const videos = useMemo<MediaStreamTrack[]>(() => {
        return videoTracks.reduce<MediaStreamTrack[]>(
            (prev: MediaStreamTrack[], curr: VideoTrack) => {
                if (videoProducers[curr._id]) {
                    return [...prev, videoProducers[curr._id].track]
                } else if (videoConsumers[curr._id]) {
                    return [...prev, videoConsumers[curr._id].track]
                }
                return prev
            },
            []
        )
    }, [videoProducers, videoConsumers, videoTracks])

    const ConductorButton = () =>
        hasAdminRights ? (
            <button
                onClick={() => {
                    emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: memberId,
                        isDirector: !member.isDirector,
                    })
                }}
                className={`round minimal ${styles.conductorToggle}`}
            >
                {member.isDirector ? <AiFillStar /> : <AiOutlineStar />}
            </button>
        ) : null

    if (videos.length > 0) {
        return (
            <>
                {videos.map((track) => (
                    <div
                        key={track.id}
                        className={styles.memberView}
                        style={{
                            borderWidth: !groupColor ? 0 : undefined,
                            borderColor: groupColor,
                        }}
                    >
                        <VideoView track={track} className={styles.video} />
                        <div className={styles.info}>
                            <div
                                className={`${styles.status} ${member.active ? styles.online : ''}`}
                            />
                            <div className={styles.names}>
                                <h6
                                    className={styles.groupName}
                                    style={{
                                        color: groupColor,
                                    }}
                                >
                                    {groupName}
                                </h6>
                                <h5 className={styles.memberName}>{user?.name || member._id}</h5>
                            </div>
                        </div>
                        <ConductorButton />
                    </div>
                ))}
            </>
        )
    }

    return (
        <div
            className={styles.memberView}
            style={{
                borderColor: groupColor,
            }}
        >
            <div className={`${styles.info} ${styles.centered}`}>
                <Avatar name={user?.name || member._id} color={groupColor} />
                <div className={`${styles.status} ${member.active ? styles.online : ''}`} />
                <div className={styles.names}>
                    <h6
                        className={styles.groupName}
                        style={{
                            color: groupColor,
                        }}
                    >
                        {groupName}
                    </h6>
                    <h5 className={styles.memberName}>{user?.name || member._id}</h5>
                </div>
                <ConductorButton />
            </div>
        </div>
    )
}

export default MemberView

import React, { useMemo } from 'react'
import styles from './StageView.module.scss'
import VideoView from './VideoView'
import Avatar from './Avatar'
import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, VideoTrack } from '@digitalstage/api-types'
import useWebRTCTracks from '../../api/hooks/useWebRTCTracks'
import { AiFillStar, AiOutlineStar } from 'react-icons/ai'

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
    const member = useStageSelector((state) => state.stageMembers.byId[memberId])
    const user = useStageSelector((state) => (member ? state.users.byId[member.userId] : undefined))
    const videoTracks = useStageSelector(
        (state) =>
            state.videoTracks.byStageMember[memberId]?.map((id) => state.videoTracks.byId[id]) || []
    )
    const mediasoupVideoConsumers = useStageSelector((state) => state.mediasoup.videoConsumers)
    const mediasoupVideoProducers = useStageSelector((state) => state.mediasoup.videoProducers)
    const { localVideoTracks: localWebRTCTracks, remoteVideoTracks: remoteWebRTCTracks } =
        useWebRTCTracks()
    const { emit } = useConnection()

    const videos = useMemo<MediaStreamTrack[]>(() => {
        return videoTracks.reduce<MediaStreamTrack[]>(
            (prev: MediaStreamTrack[], curr: VideoTrack) => {
                if (mediasoupVideoConsumers.byId[curr._id]) {
                    return [...prev, mediasoupVideoConsumers.byId[curr._id].track]
                } else if (mediasoupVideoProducers.byId[curr._id]) {
                    const track = mediasoupVideoProducers.byId[curr._id].track
                    if (track) return [...prev, track]
                } else if (curr.trackId && localWebRTCTracks[curr.trackId]) {
                    return [...prev, localWebRTCTracks[curr.trackId]]
                } else if (curr.trackId && remoteWebRTCTracks[curr.trackId]) {
                    return [...prev, remoteWebRTCTracks[curr.trackId]]
                }
                return prev
            },
            []
        )
    }, [
        localWebRTCTracks,
        mediasoupVideoConsumers.byId,
        mediasoupVideoProducers.byId,
        remoteWebRTCTracks,
        videoTracks,
    ])

    console.log('RERENDER MemberVideo', videos)

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

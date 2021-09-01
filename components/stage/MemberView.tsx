import React from 'react'
import styles from './StageView.module.scss'
import { VideoView } from './VideoView'
import { Avatar } from './Avatar'
import {
    useStageSelector,
    useVideoConsumers,
    useVideoProducer,
    useWebRTCLocalVideoTrack,
    useWebRTCRemoteVideoTracks,
    useWebRTCStats,
} from '@digitalstage/api-client-react'
import { ConductorButton } from './ConductorButton'

const useStageMemberTracks = (stageMemberId: string) => {
    const isLocal = useStageSelector<boolean>(
        (state) => state.stageMembers.byId[stageMemberId].userId === state.globals.localUserId
    )
    const videoTracks = useStageSelector(
        (state) =>
            state.videoTracks.byStageMember[stageMemberId]
                ?.map((id) => state.videoTracks.byId[id])
                .map((track) => ({
                    _id: track._id,
                    stageDeviceId: track.stageDeviceId,
                    trackId: track.trackId,
                })) || []
    )
    const stageDeviceIds = useStageSelector(
        (state) => state.stageDevices.byStageMember[stageMemberId] || []
    )
    const videoConsumers = useVideoConsumers()
    const videoProducer = useVideoProducer()
    const localVideoTrack = useWebRTCLocalVideoTrack()
    const remoteVideoTracks = useWebRTCRemoteVideoTracks()

    return React.useMemo(() => {
        const tracks: MediaStreamTrack[] = []
        if (isLocal) {
            // Use only local tracks
            if (localVideoTrack) {
                tracks.push(localVideoTrack)
            }
            if (videoProducer) {
                tracks.push(videoProducer.track)
            }
        } else {
            // Use remote tracks
            videoTracks.forEach((videoTrack) => {
                if (videoConsumers[videoTrack._id]) {
                    tracks.push(videoConsumers[videoTrack._id].track)
                }
            })
            stageDeviceIds.forEach((stageDeviceId) => {
                if (remoteVideoTracks[stageDeviceId]) {
                    tracks.push(remoteVideoTracks[stageDeviceId])
                }
            })
        }
        return tracks
    }, [
        isLocal,
        localVideoTrack,
        remoteVideoTracks,
        stageDeviceIds,
        videoConsumers,
        videoProducer,
        videoTracks,
    ])
}

const MemoizedVideoView = React.memo(VideoView)

const VideoTrackView = ({
    track,
    groupColor,
    active,
    groupName,
    stageMemberId,
    userName,
    hasCurrentUserAdminRights,
}: {
    track: MediaStreamTrack
    stageMemberId: string
    groupColor?: string
    active?: boolean
    groupName: string
    userName: string
    hasCurrentUserAdminRights: boolean
}) => {
    const stats = useWebRTCStats(track.id)
    return (
        <div
            key={track.id}
            className={styles.memberView}
            style={{
                borderWidth: !groupColor ? 0 : undefined,
                borderColor: groupColor,
            }}
        >
            <MemoizedVideoView track={track} className={styles.video} />
            <div className={styles.info}>
                <div className={`${styles.status} ${active ? styles.online : ''}`} />
                <div className={styles.names}>
                    <h6
                        className={styles.groupName}
                        style={{
                            color: groupColor,
                        }}
                    >
                        {groupName}
                    </h6>
                    <h5 className={styles.memberName}>{userName}</h5>
                </div>
                {stats ? (
                    <span className={styles.stats}>
                        {stats.roundTripTime ? <span>{`RTT ${stats.roundTripTime}ms`}</span> : null}
                        {stats.jitter ? <span>{`Jitter ${stats.jitter}%/s`}</span> : null}
                        {stats.jitterBufferDelay ? (
                            <span>{`Jitterbuffer ${stats.jitterBufferDelay}ms`}</span>
                        ) : null}
                    </span>
                ) : null}
            </div>
            {hasCurrentUserAdminRights ? <ConductorButton stageMemberId={stageMemberId} /> : null}
        </div>
    )
}

const MemberWithoutVideo = ({
    userName,
    stageMemberId,
    isActive,
    groupName,
    groupColor,
    hasCurrentUserAdminRights,
}: {
    userName: string
    stageMemberId: string
    isActive: boolean
    groupName: string
    groupColor: string
    hasCurrentUserAdminRights: boolean
}): JSX.Element => {
    return (
        <div
            className={styles.memberView}
            style={{
                borderColor: groupColor,
            }}
        >
            <div className={`${styles.info} ${styles.centered}`}>
                <Avatar name={userName} color={groupColor} />
                <div className={`${styles.status} ${isActive ? styles.online : ''}`} />
                <div className={styles.names}>
                    <h6
                        className={styles.groupName}
                        style={{
                            color: groupColor,
                        }}
                    >
                        {groupName}
                    </h6>
                    <h5 className={styles.memberName}>{userName}</h5>
                </div>
                {hasCurrentUserAdminRights ? (
                    <ConductorButton stageMemberId={stageMemberId} />
                ) : null}
            </div>
        </div>
    )
}

const MemoizedVideoTrackView = React.memo(VideoTrackView)
const MemoizedMemberWithoutVideo = React.memo(MemberWithoutVideo)
const MemberView = ({
    stageMemberId,
    groupColor,
    groupName,
    hasCurrentUserAdminRights,
}: {
    stageMemberId: string
    groupColor?: string
    groupName?: string
    hasCurrentUserAdminRights?: boolean
}) => {
    const userName = useStageSelector(
        (state) => state.users.byId[state.stageMembers.byId[stageMemberId].userId].name
    )
    const isActive = useStageSelector((state) => state.stageMembers.byId[stageMemberId].active)
    const videos = useStageMemberTracks(stageMemberId)

    if (videos.length > 0) {
        return (
            <>
                {videos.map((track) => (
                    <MemoizedVideoTrackView
                        key={track.id}
                        stageMemberId={stageMemberId}
                        userName={userName || stageMemberId}
                        groupColor={groupColor}
                        groupName={groupName}
                        active={isActive}
                        hasCurrentUserAdminRights={hasCurrentUserAdminRights}
                        track={track}
                    />
                ))}
            </>
        )
    }

    return (
        <MemoizedMemberWithoutVideo
            stageMemberId={stageMemberId}
            userName={userName}
            isActive={isActive}
            groupName={groupName}
            groupColor={groupColor}
            hasCurrentUserAdminRights={hasCurrentUserAdminRights}
        />
    )
}
const MemoizedMemberView = React.memo(MemberView)
export { MemoizedMemberView as MemberView }

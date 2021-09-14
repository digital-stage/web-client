import {
    useCurrentStageAdminSelector,
    useStageSelector,
    useVideoConsumer,
    useVideoProducer,
    useWebRTCLocalVideo,
    useWebRTCRemoteVideoByStageDevice,
} from '@digitalstage/api-client-react'
import React from 'react'
import {StageMemberBox} from "./StageMemberBox";
const StageMemberVideoTrackView = ({
    videoTrackId,
    userName,
    groupName,
    groupColor,
    active,
    conductorId,
}: {
    videoTrackId: string
    userName: string
    groupName: string
    groupColor: string
    active: boolean
    conductorId: string
}): JSX.Element => {
    // Fetch WebRTC video by stage device (only one video per stage device possible)
    const stageDeviceId = useStageSelector(
        (state) => state.videoTracks.byId[videoTrackId].stageDeviceId
    )
    //TODO: Not working, mediasoup consumers are not displayed, but there
    const webRTCTrack = useWebRTCRemoteVideoByStageDevice(stageDeviceId)
    // Fetch Mediasoup consumer by this videoTrackId
    const mediasoupConsumer = useVideoConsumer(videoTrackId)

    // Determine which track to use
    const track = React.useMemo(() => {
        if (webRTCTrack) return webRTCTrack
        if (mediasoupConsumer) return mediasoupConsumer.track
        return undefined
    }, [mediasoupConsumer, webRTCTrack])

    if (track) {
        return (
            <StageMemberBox
                userName={userName}
                active={active}
                groupName={groupName}
                groupColor={groupColor}
                conductorId={conductorId}
                track={track}
            />
        )
    }
    return null
}

const MemberView = ({
    stageMemberId,
    groupName,
    groupColor,
}: {
    stageMemberId: string
    groupColor?: string
    groupName?: string
}) => {
    const isStageAdmin = useCurrentStageAdminSelector()
    const userName = useStageSelector<string>(
        (state) => state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
    )
    const active = useStageSelector<boolean>(
        (state) => state.stageMembers.byId[stageMemberId].active
    )
    const remoteVideoTrackIds = useStageSelector<string[]>(
        (state) =>
            state.videoTracks.byStageMember[stageMemberId]?.filter(
                (id) =>
                    state.videoTracks.byId[id].stageDeviceId !== state.globals.localStageDeviceId
            ) || []
    )
    const isLocal = useStageSelector<boolean>(
        (state) => state.globals.stageMemberId === stageMemberId
    )
    const localProducer = useVideoProducer()
    const localWebRTCTrack = useWebRTCLocalVideo()
    const localTrack = React.useMemo<MediaStreamTrack>(() => {
        if (isLocal) {
            if (localWebRTCTrack) {
                return localWebRTCTrack
            }
            if (localProducer) {
                return localProducer.track
            }
        }
        return undefined
    }, [isLocal, localProducer, localWebRTCTrack])

    return (
        <>
            {!!localTrack || remoteVideoTrackIds.length > 0 ? (
                <>
                    {!!localTrack ? (
                        <StageMemberBox
                            userName={userName || stageMemberId}
                            active={active}
                            groupName={groupName}
                            groupColor={groupColor}
                            conductorId={isStageAdmin ? stageMemberId : undefined}
                            track={localTrack}
                        />
                    ) : null}
                    {remoteVideoTrackIds.map((videoTrackId) => (
                        <StageMemberVideoTrackView
                            key={videoTrackId}
                            videoTrackId={videoTrackId}
                            userName={userName || stageMemberId}
                            active={active}
                            groupName={groupName}
                            groupColor={groupColor}
                            conductorId={isStageAdmin ? stageMemberId : undefined}
                        />
                    ))}
                </>
            ) : (
                <StageMemberBox
                    userName={userName || stageMemberId}
                    active={active}
                    groupName={groupName}
                    groupColor={groupColor}
                    conductorId={isStageAdmin ? stageMemberId : undefined}
                />
            )}
        </>
    )
}
export { MemberView }

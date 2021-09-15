import React from 'react'
import Image from 'next/image'
import landscapeIcon from '../../public/icons/landscape.svg'
import portraitIcon from '../../public/icons/portrait.svg'
import {
    useCurrentStageAdminSelector,
    useStageSelector,
    useVideoConsumers,
    useVideoProducer,
    useWebRTCLocalVideo,
    useWebRTCRemoteVideos
} from "@digitalstage/api-client-react";
import {StageMemberBox} from "./StageMemberBox";
import {StageMember} from '@digitalstage/api-types'
import {HiFilter, HiOutlineFilter} from "react-icons/hi";

const sorting = (a: StageMember, b: StageMember): number => {
    if (a.active === b.active) {
        if (a.stageId <= b.stageId) {
            return -1;
        }
        return 1;
    } else if (a.active) {
        return -1
    } else {
        return 1
    }
}

const useLocalTracks = (): MediaStreamTrack[] => {
    const mediasoupVideoProducer = useVideoProducer()
    const localVideo = useWebRTCLocalVideo()
    return React.useMemo(() => {
        let videos = []
        if (mediasoupVideoProducer) {
            videos = [mediasoupVideoProducer.track]
        }
        if (localVideo) {
            videos = [...videos, localVideo]
        }
        return videos
    }, [localVideo, mediasoupVideoProducer])
}

const useRemoteTracks = (stageMemberId: string): MediaStreamTrack[] => {
    const webRTCVideos = useWebRTCRemoteVideos()
    const stageDeviceIds = useStageSelector(state => state.stageDevices.byStageMember[stageMemberId] || [])
    const videoTrackIds = useStageSelector(state => state.videoTracks.byStageMember[stageMemberId] || [])
    const mediasoupVideoConsumers = useVideoConsumers()
    return React.useMemo<MediaStreamTrack[]>(() => {
        return [
            ...stageDeviceIds.reduce((prev, stageDeviceId) => {
                if (webRTCVideos[stageDeviceId]) {
                    return [...prev, webRTCVideos[stageDeviceId]]
                }
                return prev
            }, []),
            ...videoTrackIds.reduce((prev, videoTrackId) => {
                if (mediasoupVideoConsumers[videoTrackId]) {
                    return [...prev, mediasoupVideoConsumers[videoTrackId]]
                }
                return prev
            }, [])
        ]
    }, [mediasoupVideoConsumers, stageDeviceIds, videoTrackIds, webRTCVideos])
}

const LocalView = ({hasAdminRights}: { hasAdminRights: boolean }) => {
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const userName = useStageSelector(state => state.globals.localUserId ? state.users.byId[state.globals.localUserId].name : "Local user")
    const groupName = useStageSelector(state => state.globals.groupId ? state.groups.byId[state.globals.groupId].name : "")
    const groupColor = useStageSelector(state => state.globals.groupId ? state.groups.byId[state.globals.groupId].color : "")

    // Gather all tracks together
    const remoteTracks = useRemoteTracks(localStageMemberId)
    const localTracks = useLocalTracks()

    const tracks = [...remoteTracks, ...localTracks]

    return (
        <>
            {tracks.length > 0 ? (
                <>
                    {tracks.map(track => <StageMemberBox
                        key={track.id}
                        userName={userName}
                        groupName={groupName}
                        groupColor={groupColor}
                        active={true}
                        conductorId={hasAdminRights ? localStageMemberId : undefined}
                        track={track}
                    />)}
                </>
            ) : (
                <StageMemberBox
                    userName={userName}
                    groupName={groupName}
                    groupColor={groupColor}
                    active={true}
                    conductorId={hasAdminRights ? localStageMemberId : undefined}
                />
            )}
        </>
    )
}

const StageMemberView = ({stageMember, hasAdminRights}: { stageMember: StageMember, hasAdminRights: boolean }) => {
    const {_id, userId, groupId, active} = stageMember
    const userName = useStageSelector(state => state.users.byId[userId].name)
    const groupName = useStageSelector(state => state.groups.byId[groupId].name)
    const groupColor = useStageSelector(state => state.groups.byId[groupId].color)
    const tracks = useRemoteTracks(_id)

    if (tracks.length === 0) {
        return (
            <StageMemberBox
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={active}
                conductorId={hasAdminRights ? stageMember._id : undefined}
            />
        )
    }

    return (
        <>
            {tracks.map(track => (
                <StageMemberBox
                    key={track.id}
                    userName={userName}
                    groupName={groupName}
                    groupColor={groupColor}
                    active={true}
                    conductorId={hasAdminRights ? stageMember._id : undefined}
                    track={track}
                />
            ))}
        </>
    )
}

const StageView = ({stageId}: { stageId: string }) => {
    const [showLanes, setShowLanes] = React.useState<boolean>(false)
    const [showOffline, setShowOffline] = React.useState<boolean>(true)
    const hasAdminRights = useCurrentStageAdminSelector()

    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const stageMembers = useStageSelector(state => state.stageMembers.byStage[stageId]
        .map(id => state.stageMembers.byId[id]))
    // Sort stage members first
    const sortedStageMembers = React.useMemo(() => {
        if (showOffline) {
            return stageMembers.sort(sorting)
        }
        return stageMembers.filter(stageMember => stageMember.active).sort(sorting)
    }, [stageMembers, showOffline])

    return (
        <div className={`wrapper stageLayout`}>
            <div className={`membersGrid ${showLanes ? 'lanes' : ''}`}>
                {sortedStageMembers
                    .map(stageMember => {
                        if (stageMember._id === localStageMemberId) {
                            return (<LocalView
                                key={stageMember._id}
                                hasAdminRights={hasAdminRights}
                            />)
                        }
                        return (<StageMemberView
                                key={stageMember._id}
                                stageMember={stageMember}
                                hasAdminRights={hasAdminRights}/>
                        )
                    })}
            </div>
            <div className="control">
                <button className="round" onClick={() => setShowOffline(prev => !prev)}>
                    {showOffline ? <HiOutlineFilter/> : <HiFilter/>}
                </button>
                <button className="round" onClick={() => setShowLanes(prev => !prev)}>
                    {showLanes
                        ? (<Image src={portraitIcon} alt="Auf Hochkantdarstellung umschalten"/>)
                        : (<Image src={landscapeIcon} alt="Auf Breitbilddarstellung umschalten"/>)}
                </button>
            </div>
        </div>
    )
}
export {StageView}

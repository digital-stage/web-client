import {
    useCurrentStageAdminSelector, useRemoteVideos,
    useStageSelector, useWebcam,
} from '@digitalstage/api-client-react'
import React from 'react'
import {StageMemberBox} from "./StageMemberBox";

const LocalStageMemberView = ({hasAdminRights}: { hasAdminRights: boolean }) => {
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const userName = useStageSelector(state => state.globals.localUserId ? state.users.byId[state.globals.localUserId].name : "Local user")
    const groupName = useStageSelector(state => state.globals.groupId ? state.groups.byId[state.globals.groupId].name : "")
    const groupColor = useStageSelector(state => state.globals.groupId ? state.groups.byId[state.globals.groupId].color : "")

    // Gather all tracks together
    const remoteTracks = useRemoteVideos(localStageMemberId)
    const localTrack = useWebcam()

    return (
        <>
            <StageMemberBox
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={true}
                conductorId={hasAdminRights ? localStageMemberId : undefined}
                track={localTrack}
            />
            {remoteTracks.map(track => <StageMemberBox
                key={track.id}
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={true}
                conductorId={hasAdminRights ? localStageMemberId : undefined}
                track={track}
            />)}
        </>
    )
}

const RemoteStageMemberView = ({stageMemberId, hasAdminRights}: { stageMemberId: string, hasAdminRights: boolean }) => {
    const active = useStageSelector(state => state.stageMembers.byId[stageMemberId].active)
    const userName = useStageSelector(state => state.users.byId[state.stageMembers.byId[stageMemberId].userId].name)
    const groupName = useStageSelector(state => state.groups.byId[state.stageMembers.byId[stageMemberId].groupId].name)
    const groupColor = useStageSelector(state => state.groups.byId[state.stageMembers.byId[stageMemberId].groupId].color)
    const tracks = useRemoteVideos(stageMemberId)

    if (tracks.length === 0) {
        return (
            <StageMemberBox
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={active}
                conductorId={hasAdminRights ? stageMemberId : undefined}
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
                    conductorId={hasAdminRights ? stageMemberId : undefined}
                    track={track}
                />
            ))}
        </>
    )
}

const StageMemberView = ({stageMemberId}: { stageMemberId: string }) => {
    const hasAdminRights = useCurrentStageAdminSelector()
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    if (stageMemberId === localStageMemberId) {
        return (<LocalStageMemberView
            key={stageMemberId}
            hasAdminRights={hasAdminRights}
        />)
    }
    return (<RemoteStageMemberView
            key={stageMemberId}
            stageMemberId={stageMemberId}
            hasAdminRights={hasAdminRights}/>
    )
}
export { StageMemberView }

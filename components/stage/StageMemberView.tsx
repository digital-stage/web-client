/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
    const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageMember[state.globals.stageMemberId] && state.audioTracks.byStageMember[state.globals.stageMemberId].length > 0)

    return (
        <>
            <StageMemberBox
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={true}
                conductorId={hasAdminRights ? localStageMemberId : undefined}
                track={localTrack}
                muted={!hasAudioTracks}
            />
            {remoteTracks.map(track => <StageMemberBox
                key={track.id}
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={true}
                conductorId={hasAdminRights ? localStageMemberId : undefined}
                track={track}
                muted={!hasAudioTracks}
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
    const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageMember[stageMemberId] && state.audioTracks.byStageMember[stageMemberId].length > 0)

    if (tracks.length === 0) {
        return (
            <StageMemberBox
                userName={userName}
                groupName={groupName}
                groupColor={groupColor}
                active={active}
                muted={!hasAudioTracks}
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
                    muted={!hasAudioTracks}
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

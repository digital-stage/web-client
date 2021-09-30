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
  useCurrentStageAdminSelector,
  useRemoteVideoTracks,
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
  const remoteTracks = useRemoteVideoTracks(localStageMemberId)
  const localTrack = useWebcam()
  const videoTrackId = useStageSelector<string | undefined>(state => state.videoTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0 ? state.videoTracks.byStageDevice[state.globals.localStageDeviceId][0] : undefined)
  const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0 || false)

  return (
    <>
      <StageMemberBox
        userName={userName}
        groupName={groupName}
        groupColor={groupColor}
        active={true}
        conductorId={hasAdminRights ? localStageMemberId : undefined}
        track={localTrack}
        videoTrackId={videoTrackId}
        muted={!hasAudioTracks}
      />
      {Object.keys(remoteTracks).map(videoTrackId => <StageMemberBox
        key={videoTrackId}
        userName={userName}
        groupName={groupName}
        groupColor={groupColor}
        active={true}
        conductorId={hasAdminRights ? localStageMemberId : undefined}
        track={remoteTracks[videoTrackId]}
        videoTrackId={videoTrackId}
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
  const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageMember[stageMemberId] && state.audioTracks.byStageMember[stageMemberId].length > 0)
  const videoTracks = useRemoteVideoTracks(stageMemberId)

  if (Object.keys(videoTracks).length === 0) {
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
      {Object.keys(videoTracks).map(videoTrackId => (
        <StageMemberBox
          key={videoTrackId}
          userName={userName}
          groupName={groupName}
          groupColor={groupColor}
          active={true}
          conductorId={hasAdminRights ? stageMemberId : undefined}
          videoTrackId={videoTrackId}
          track={videoTracks[videoTrackId]}
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
export {StageMemberView}

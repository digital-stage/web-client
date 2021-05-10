import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Group,
    Stage,
    StageMember,
    StageDevice,
    useConnection,
    User,
    useStageSelector,
    useMediasoup,
} from '@digitalstage/api-client-react'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { AudioTrack, VideoTrack } from '@digitalstage/api-types'
import PrimaryButton from '../components/ui/button/PrimaryButton'
import DangerButton from '../components/ui/button/DangerButton'
import SecondaryButton from '../components/ui/button/SecondaryButton'
import SingleVideoPlayer from '../components/ui/media/SingleVideoPlayer'
import DevicePanel from '../components/devices/DevicePanel'

const AudioPlayer = (props: { track: MediaStreamTrack }) => {
    const { track } = props
    const audioRef = useRef<HTMLAudioElement>()

    useEffect(() => {
        if (audioRef) {
            audioRef.current.srcObject = new MediaStream([track])
            audioRef.current.autoplay = true
            audioRef.current.play()
        }
    }, [track, audioRef])

    return (
        <div>
            PLAYER
            <audio autoPlay playsInline ref={audioRef} />
        </div>
    )
}

const AudioTrackView = (props: { id: string }) => {
    const { id } = props
    const audioTrack = useStageSelector<AudioTrack>((state) => state.audioTracks.byId[id])
    const { audioConsumers } = useMediasoup()
    if (audioTrack) {
        return (
            <div>
                <span>AUDIO TRACK {audioTrack._id}</span>
                {audioConsumers[audioTrack._id] && (
                    <AudioPlayer track={audioConsumers[audioTrack._id].track} />
                )}
            </div>
        )
    }
    return <></>
}

const VideoTrackView = (props: { id: string }) => {
    const { id } = props
    const videoTrack = useStageSelector<VideoTrack>((state) => state.videoTracks.byId[id])
    const { videoConsumers } = useMediasoup()
    if (videoTrack) {
        return (
            <div>
                {videoTrack._id}
                {videoConsumers[videoTrack._id] && (
                    <SingleVideoPlayer
                        width="auto"
                        height="300px"
                        track={videoConsumers[videoTrack._id].track}
                    />
                )}
            </div>
        )
    }
    return <></>
}

const StageDeviceView = (props: { id: string }) => {
    const { id } = props
    const stageDevice = useStageSelector<StageDevice>((state) => state.stageDevices.byId[id])
    const videoTrackIds = useStageSelector<string[]>(
        (state) => state.videoTracks.byStageDevice[id] || []
    )
    const audioTrackIds = useStageSelector<string[]>(
        (state) => state.audioTracks.byStageDevice[id] || []
    )

    return (
        <li>
            {stageDevice._id}
            ORDER: {stageDevice.order}
            {videoTrackIds.map((videoTrackId) => (
                <VideoTrackView key={videoTrackId} id={videoTrackId} />
            ))}
            {audioTrackIds.map((audioTrackId) => (
                <AudioTrackView key={audioTrackId} id={audioTrackId} />
            ))}
        </li>
    )
}

const StageMemberView = (props: { id: string }) => {
    const { id } = props
    const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
    const remoteUser = useStageSelector<User>((state) => state.remoteUsers.byId[stageMember.userId])
    const stageDeviceIds = useStageSelector<string[]>(
        (state) => state.stageDevices.byStageMember[id] || []
    )
    return (
        <li>
            Stage member: {remoteUser.name}
            <ul>
                {stageDeviceIds.map((stageDeviceId) => (
                    <StageDeviceView key={stageDeviceId} id={stageDeviceId} />
                ))}
            </ul>
        </li>
    )
}

const GroupView = (props: { id: string; stageId: string }) => {
    const connection = useConnection()
    const { id, stageId } = props
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const stageMemberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[id] || []
    )
    const currentGroupId = useStageSelector<string | undefined>((state) => state.globals.groupId)
    return (
        <li>
            <h5>
                {group.name} &nbsp;
                {currentGroupId && currentGroupId === id ? (
                    <DangerButton onClick={() => connection.emit(ClientDeviceEvents.LeaveStage)}>
                        Leave
                    </DangerButton>
                ) : (
                    <PrimaryButton
                        onClick={() =>
                            connection.emit(ClientDeviceEvents.JoinStage, {
                                stageId,
                                groupId: id,
                            } as ClientDevicePayloads.JoinStage)
                        }
                    >
                        Join
                    </PrimaryButton>
                )}
            </h5>

            <ul>
                {stageMemberIds.map((stageMemberId) => (
                    <StageMemberView key={stageMemberId} id={stageMemberId} />
                ))}
            </ul>
        </li>
    )
}

const StageView = (props: { id: string }) => {
    const { id } = props
    const stage = useStageSelector<Stage>((state) => state.stages.byId[id])
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[id] || [])
    return (
        <li>
            <h4>
                {stage.name} ({stage.videoType}/{stage.audioType})
            </h4>
            <ul>
                {groupIds.map((groupId) => (
                    <GroupView key={groupId} id={groupId} stageId={id} />
                ))}
            </ul>
        </li>
    )
}

const DEBUG = () => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds)

    if (ready) {
        return (
            <div>
                <h1>Devices</h1>
                <ul>
                    {deviceIds.map((deviceId) => (
                        <DevicePanel key={deviceId} id={deviceId} />
                    ))}
                </ul>
                <h1>Stages</h1>
                <Link href="/stages">
                    <a>
                        <SecondaryButton>Manage stages</SecondaryButton>
                    </a>
                </Link>
                <ul>
                    {stageIds.map((stageId) => (
                        <StageView key={stageId} id={stageId} />
                    ))}
                </ul>
            </div>
        )
    }
    return <div>Loading</div>
}
export default DEBUG

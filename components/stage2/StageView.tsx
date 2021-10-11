import {
    selectGroupIdsOfCurrentStage,
    selectNumCols,
     selectShowLanes,
    useRemoteVideoTracks,
    useStageSelector, useWebcam
} from "@digitalstage/api-client-react";
import React from "react";
import {useSelectStageMemberIdsByGroup} from "../../api/redux/selectors/useSelectStageMemberIds";
import {FaMusic} from "react-icons/fa";
import {VideoPlayer} from "./VideoPlayer";
import {AiOutlineAudioMuted} from "react-icons/ai";
import {Avatar} from "./Avatar";
import {SettingsModal} from "./SettingsModal";
import {GoSettings} from "react-icons/go";
import {Heading5, Heading6} from "../../ui/Heading";


const Box = ({
                 name,
                 color,
                 groupName,
                 track,
                 videoTrackId,
                 online,
                 muted
             }: {
    name: string,
    color?: string,
    groupName?: string,
    track?: MediaStreamTrack
    videoTrackId?: string,
    online?: boolean,
    muted?: boolean
}) => {
    const numCols = useStageSelector(selectNumCols)
    const showLanes = useStageSelector(selectShowLanes)

    const [videoMuted, setVideoMuted] = React.useState<boolean>(track ? track.muted : false)
    React.useEffect(() => {
        if (track) {
            const onMute = () => setVideoMuted(true)
            const onUnmute = () => setVideoMuted(false)
            track.addEventListener("mute", onMute)
            track.addEventListener("unmute", onUnmute)
            return () => {
                track.removeEventListener("mute", onMute)
                track.removeEventListener("unmute", onUnmute)
            }
        }
    }, [track])

    const width = showLanes
        ? `calc(${Math.floor((1000 / numCols) * 100) / 1000}vw - 16px - var(--sidebar-width) / ${numCols})`
        : `${Math.floor((1000 / numCols) * 100) / 1000}%`
    const height = showLanes ? '100%' : 'auto'
    return (
        <>
            <div className="box" style={{
                width: width,
                flexBasis: width,
                height: height,
            }}>
                <div className="ratio" style={{
                    paddingTop: showLanes ? 0 : '56.25%',
                    height: height,
                }}>
                    <div className="inner">
                        {track && <VideoPlayer track={track}/>}
                        {muted && <span className="muted"><AiOutlineAudioMuted/></span>}
                        <div className={`info ${!track ? 'centered' : ''}`}>
                            {name && <Avatar name={name} color={color} active={online}/>}
                            <div className="names">
                                {groupName && (
                                    <Heading6
                                        className="groupName"
                                        style={{
                                            color: color,
                                        }}
                                    >
                                        {groupName}
                                    </Heading6>
                                )}
                                {name && <Heading5 className="memberName">{name}</Heading5>}
                                {videoMuted &&
                                <span style={{
                                    fontSize: "0.6rem",
                                    color: "var(---danger)"
                                }}>Schlechte Internetverbindung</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const LocalStageMemberView = ({color, groupName}: { color?: string, groupName?: string }): JSX.Element | null => {
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const userName = useStageSelector<string>(state => state.globals.localUserId && state.users.byId[state.globals.localUserId]?.name || "Local user")

    // Gather all tracks together
    const remoteTracks = useRemoteVideoTracks(localStageMemberId)
    const localTrack = useWebcam()
    const videoTrackId = useStageSelector<string | undefined>(state =>
        state.globals.localStageDeviceId &&
        state.videoTracks.byStageDevice[state.globals.localStageDeviceId] &&
        state.videoTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0
            ? state.videoTracks.byStageDevice[state.globals.localStageDeviceId][0]
            : undefined)
    const hasAudioTracks = useStageSelector<boolean>(state => state.globals.localStageDeviceId && state.audioTracks.byStageDevice[state.globals.localStageDeviceId]?.length > 0 || false)

    return (
        <>
            <Box
                key={videoTrackId}
                name={userName}
                groupName={groupName}
                color={color}
                track={localTrack}
                videoTrackId={videoTrackId}
                muted={!hasAudioTracks}
                online={true}
            />
            {Object.keys(remoteTracks).map(videoTrackId =>
                <Box
                    key={videoTrackId}
                    name={userName}
                    groupName={groupName}
                    color={color}
                    muted={!hasAudioTracks}
                    online={true}
                />
            )}
        </>
    )
}
const RemoteStageMemberView = ({
                                   stageMemberId,
                                   color, groupName
                               }: { stageMemberId: string, color?: string, groupName?: string }): JSX.Element => {
    const online = useStageSelector<boolean>(state => state.stageMembers.byId[stageMemberId].active)
    const userName = useStageSelector<string>(state => state.stageMembers.byId[stageMemberId].userId && state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name || stageMemberId)
    const hasAudioTracks = useStageSelector<boolean>(state => state.audioTracks.byStageMember[stageMemberId] && state.audioTracks.byStageMember[stageMemberId].length > 0)
    const videoTracks = useRemoteVideoTracks(stageMemberId)

    if (Object.keys(videoTracks).length > 0) {
        return (
            <>
                {Object.keys(videoTracks).map(videoTrackId => (
                    <Box
                        key={videoTrackId}
                        name={userName}
                        color={color}
                        videoTrackId={videoTrackId}
                        track={videoTracks[videoTrackId]}
                        muted={!hasAudioTracks}
                        groupName={groupName}
                        online={online}
                    />
                ))}
            </>
        )
    }

    return (
        <Box
            name={userName}
            color={color}
            groupName={groupName}
            online={online}
            muted={!hasAudioTracks}
        />
    )
}

const StageMemberView = ({
                             stageMemberId,
                             color,
                             groupName
                         }: { stageMemberId: string, color?: string, groupName?: string }): JSX.Element => {
    const isLocal = useStageSelector<boolean>(state => state.globals.stageMemberId === stageMemberId)
    if (isLocal) {
        return <LocalStageMemberView color={color} groupName={groupName}/>
    }
    return <RemoteStageMemberView stageMemberId={stageMemberId} color={color} groupName={groupName}/>
}

const GroupView = ({groupId, isOnlyGroup}: { groupId: string, isOnlyGroup?: boolean }): JSX.Element | null => {
    const name = useStageSelector(state => state.groups.byId[groupId].name)
    const color = useStageSelector(state => state.groups.byId[groupId].color)
    const sortedStageMemberIds = useSelectStageMemberIdsByGroup(groupId)
    const showLanes = useStageSelector(selectShowLanes)

    if (sortedStageMemberIds.length > 0) {
        return (
            <>
                <div className={`group${showLanes ? ' lanes' : ''}`}>
                    {isOnlyGroup && (
                        <div className="groupInfo">
                            <div className="groupName" style={{
                                borderColor: color
                            }}>
                                <div className="groupIcon" style={{
                                    backgroundColor: color
                                }}>
                                    <FaMusic/>
                                </div>
                                <span>
                                {name}
                            </span>
                            </div>
                        </div>
                    )}
                    <div className={`groupGrid${isOnlyGroup ? ' single' : ''}`}>
                        {sortedStageMemberIds.map(stageMemberId => <StageMemberView key={stageMemberId}
                                                                                    color={!isOnlyGroup ? color : undefined}
                                                                                    stageMemberId={stageMemberId}
                                                                                    groupName={name}
                        />)}
                    </div>
                </div>
            </>
        )
    }

    return null
}

const StageView = (): JSX.Element => {
    const showLanes = useStageSelector<boolean>(selectShowLanes)
    const groupIds = useStageSelector<string[]>(selectGroupIdsOfCurrentStage)

    const [modalVisible, setModalVisible] = React.useState<boolean>(false)
    const showModal = React.useCallback(() => setModalVisible(true), [])
    const hideModal = React.useCallback(() => setModalVisible(false), [])

    return (
        <>
            <div className={`stageGrid${showLanes ? ` lanes` : ''}`}>
                {groupIds.map(groupId => <GroupView key={groupId} groupId={groupId}
                                                    isOnlyGroup={groupIds.length > 1}/>)}
                <div className="control">
                    <button className="round" onClick={showModal}>
                        <GoSettings/>
                    </button>
                </div>
                <SettingsModal open={modalVisible} onClose={hideModal}/>
            </div>
        </>
    )
}
export {StageView}
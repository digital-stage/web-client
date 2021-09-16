import {
    useRemoteVideos,
    useStageSelector,
    useWebcam,
} from "@digitalstage/api-client-react";
import {VideoPlayer} from "../components/stage/VideoPlayer";
import React from "react";


const StageVideoBox = ({username, track}: { username: string, track?: MediaStreamTrack }) => {
    return (
        <div>
            <h5>{username}</h5>
            {track && <VideoPlayer track={track}/>}
        </div>
    )
}

const LocalStageMemberView = ({stageMemberId}: { stageMemberId: string }) => {
    const userName = useStageSelector(state => state.users.byId[state.stageMembers.byId[stageMemberId].userId].name)
    const localVideo = useWebcam()
    const remoteVideos = useRemoteVideos(stageMemberId)

    return (
        <>
            <StageVideoBox
                username={userName}
                track={localVideo}
            />
            {remoteVideos.map(track => <StageVideoBox
                key={track.id}
                username={userName}
                track={track}/>)}
        </>
    )
}

const StageMemberBlob = ({stageMemberId}: { stageMemberId: string }) => {
    const userName = useStageSelector(state => state.users.byId[state.stageMembers.byId[stageMemberId].userId].name)
    const videos = useRemoteVideos(stageMemberId)

    if (videos.length > 0) {
        return (
            <>
                {videos.map(track => <StageVideoBox key={track.id}
                                                    username={userName}
                                                    track={track}/>)}
            </>
        )
    }
    return (<StageVideoBox
        username={userName}
    />)
}

const Test = () => {
    const localStageMemberId = useStageSelector(state => state.globals.stageMemberId)
    const activeStageMemberIds = useStageSelector(state => state.globals.stageId ? state.stageMembers.byStage[state.globals.stageId].filter(id => state.stageMembers.byId[id].active) : [])

    return (
        <div className="container">
            {activeStageMemberIds.map(activeStageMemberId => {
                if (activeStageMemberId === localStageMemberId) {
                    return <LocalStageMemberView key={activeStageMemberId} stageMemberId={activeStageMemberId}/>
                }
                return <StageMemberBlob key={activeStageMemberId} stageMemberId={activeStageMemberId}/>
            })}
        </div>
    )
}
export default Test
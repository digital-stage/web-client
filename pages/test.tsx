import {
    useStageSelector,
    useVideoConsumers,
    useVideoProducer,
    useWebRTCLocalVideo,
    useWebRTCRemoteVideos
} from "@digitalstage/api-client-react";
import {VideoPlayer} from "../components/stage/VideoPlayer";
import React from "react";

const useLocalVideos = (): MediaStreamTrack[] => {
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

const useRemoteVideos = (stageMemberId: string): MediaStreamTrack[] => {
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
    const localVideos = useLocalVideos()
    const remoteVideos = useRemoteVideos(stageMemberId)

    const videos = [...localVideos, ...remoteVideos]

    if (videos.length > 0) {
        return (
            <>
                {videos.map(track => <StageVideoBox
                    key={track.id}
                    username={userName}
                    track={track}/>)}
            </>
        )
    }
    return (<StageVideoBox
        username={userName}
    />)
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
    const mediasoupVideoProducer = useVideoProducer()
    const mediasoupVideoConsumers = useVideoConsumers()
    const localVideo = useWebRTCLocalVideo()
    const webRTCVideos = useWebRTCRemoteVideos()

    const sum = React.useMemo(() => {
        return Object.keys(webRTCVideos).length + Object.keys(mediasoupVideoConsumers).length
    }, [mediasoupVideoConsumers, webRTCVideos])

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
            <h4>WebRTC</h4>
            {Object.values(webRTCVideos).map(track => <VideoPlayer key={track.id} track={track}/>)}
            {localVideo && <VideoPlayer track={localVideo}/>}
            <h4>MEDIASOUP</h4>
            {Object.values(mediasoupVideoConsumers).map(consumer => <VideoPlayer key={consumer.id}
                                                                                 track={consumer.track}/>)}
            {mediasoupVideoProducer && <VideoPlayer track={mediasoupVideoProducer.track}/>}
            <h4>Summary</h4>
            {sum} remote videos
        </div>
    )
}
export default Test
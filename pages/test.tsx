import {
  useAudioContext,
  useRemoteVideos,
  useStageSelector,
  useWebcam,
} from "@digitalstage/api-client-react";
import {VideoPlayer} from "../components/stage/VideoPlayer";
import React from "react";

const AudioLatencyTest = () => {
  const [running, setRunning] = React.useState<boolean>(false)
  const [cloneStream, setCloneStream] = React.useState<boolean>(false)
  const [useWebAudio, setUseWebAudio] = React.useState<boolean>(true)
  const audioRef = React.useRef<HTMLAudioElement>(null)
  const [stream, setStream] = React.useState<MediaStream>()
  const {audioContext} = useAudioContext()

  React.useEffect(() => {
    if (running && audioRef.current) {
      let aborted = false
      let createdStream: MediaStream
      navigator.mediaDevices
        .getUserMedia(
          {
            video: false,
            audio: {
              autoGainControl: false,
              echoCancellation: false,
              noiseSuppression: false,
              latency: 0,
            } as any
          }
        )
        .then(stream => {
          createdStream = stream
          setStream(createdStream)
        })
      return () => {
        aborted = true
        setStream(undefined)
        if (createdStream) {
          createdStream.getTracks().map(track => track.stop())
        }
      }
    }
  }, [running])

  React.useEffect(() => {
    if (audioContext && stream) {
      let selectedStream = stream
      if(cloneStream) {
        console.log("Cloning media stream")
        const track = stream.getAudioTracks().pop()
        selectedStream = new MediaStream([track])
      } else {
        console.log("Using original media stream")
      }
      if (useWebAudio) {
        console.log("Using web audio")
        const source = audioContext.createMediaStreamSource(selectedStream)
        source.connect(audioContext.destination)
        const audioElement = audioRef.current
        audioElement.srcObject = selectedStream
        audioElement.muted = true
        return () => {
          source.disconnect(audioContext.destination)
          audioElement.srcObject = undefined
        }
      } else {
        console.log("Using direct audio element")
        const audioElement = audioRef.current
        audioElement.srcObject = selectedStream
        audioElement.muted = false
        audioElement.play()
        return () => {
          audioElement.pause()
          audioElement.srcObject = null
        }
      }
    }
  }, [stream, audioContext, useWebAudio, cloneStream])

  return (
    <>
      <label>
        <input type="checkbox" checked={cloneStream} onChange={(e) => setCloneStream(e.currentTarget.checked)}/>
        Clone stream
      </label>
      {` `}
      <label>
        <input type="checkbox" checked={useWebAudio} onChange={(e) => setUseWebAudio(e.currentTarget.checked)}/>
        WebAudio API
      </label>
      {` `}
      <button onClick={() => setRunning(prev => !prev)}>
        {running ? 'Stop audio latency test' : 'Test audio latency'}
      </button>
      <p>Warning: will produce Feedback! ;)</p>
      <audio ref={audioRef}/>
    </>
  )
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
      <AudioLatencyTest/>
    </div>
  )
}
export default Test
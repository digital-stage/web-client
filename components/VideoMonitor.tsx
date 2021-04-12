import {useMediasoup} from "@digitalstage/api-client-react";
import {useEffect, useRef} from "react";

const VideoPlayer = (props: {
  track: MediaStreamTrack
}) => {
  const {track} = props;
  const videoRef = useRef<HTMLVideoElement>();
  useEffect(() => {
    videoRef.current.srcObject = new MediaStream([track]);
  }, [videoRef, track]);
  return <video ref={videoRef}/>
}

const VideoMonitor = () => {
  const {videoProducers} = useMediasoup();

  return (<div>
    {Object.keys(videoProducers).map(videoProducerId => <VideoPlayer track={videoProducers[videoProducerId].track}/>)}
  </div>)
}
export default VideoMonitor;
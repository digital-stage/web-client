import styles from './StageMemberView.module.css'
import {StageMember, useMediasoup, User, useStageSelector } from "@digitalstage/api-client-react";
import React, {useEffect, useRef} from "react";

const SingleVideoTrackPlayer = (props: {
  id: string
}) => {
  const {id} = props;
  const videoRef = useRef<HTMLVideoElement>();
  const {videoConsumers} = useMediasoup();

  useEffect(() => {
    if( videoConsumers && videoRef.current ) {
      const track = videoConsumers[id].track;
      videoRef.current.srcObject = new MediaStream([track]);
    }
  }, [id, videoConsumers, videoRef])

  return <video className={styles.video} autoPlay={true} muted={true} playsInline={true} controls={false} ref={videoRef}/>
}

const MultiVideoTrackPlayer = (props: {
  ids: string[]
}) => {
  const {ids} = props;

  // TODO: Distribute videos
  return (
    <>
      {ids.map(id => <SingleVideoTrackPlayer id={id}/>)}
    </>
  )
};

const StageMemberView = (props: {
  id: string
}) => {
  const {id} = props;
  const stageMember = useStageSelector<StageMember>(state => state.stageMembers.byId[id]);
  const remoteUser = useStageSelector<User>(state => state.remoteUsers.byId[stageMember.userId]);

  const remoteVideoTrackIds = useStageSelector<string[]>(state => state.remoteVideoTracks.byStageMember[id] || []);


  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <div className={styles.banner}>
          {remoteUser.name}
        </div>
      </div>
    </div>
  )
}
export default StageMemberView;
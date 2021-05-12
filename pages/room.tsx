import React from 'react';
import {useRouter} from 'next/router';
import RoomManager from '../components/room/RoomManager';
import styles from '../styles/Room.module.css'
import {useAuth, useStageSelector} from "@digitalstage/api-client-react";

const Room = (): JSX.Element => {
  const router = useRouter();
  const ready = useStageSelector<boolean>(state => state.globals.ready);
  const stageId = useStageSelector<string>((state) => state.globals.stageId);
  const {loading, user} = useAuth();

  if (!loading && !user) {
    router.replace('/account/login');
  }

  if (ready && !stageId) {
    router.replace('/stages');
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.inner}>
        <RoomManager/>
      </div>
    </div>
  );
};
export default Room;

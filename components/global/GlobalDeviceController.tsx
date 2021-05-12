import {useConnection, useStageSelector} from "@digitalstage/api-client-react";
import {FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash} from 'react-icons/fa';
import React from "react";
import styles from './GlobalDeviceController.module.css'
import {ClientDeviceEvents, ClientDevicePayloads, Device} from "@digitalstage/api-types";
import PrimaryButton from "../../ui/button/PrimaryButton";

const GlobalDeviceController = () => {
  const devices = useStageSelector<Device[]>(state => state.devices.allIds.map(id => state.devices.byId[id]))
  const insideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  const sendVideo = devices.filter(device => device.canVideo).every(device => device.sendVideo)
  const sendAudio = devices.filter(device => device.canAudio).every(device => device.sendAudio)
  const connection = useConnection()

  if (insideStage) {
    return (
      <div className={styles.wrapper}>
        <PrimaryButton
          className={styles.button}
          round
          toggled={sendVideo}
          onClick={() => {
            devices
              .filter(device => device.canVideo)
              .forEach(device => connection.emit(ClientDeviceEvents.ChangeDevice, {
                _id: device._id,
                sendVideo: !sendVideo
              } as ClientDevicePayloads.ChangeDevice))
          }}
          title={sendVideo ? 'Kameras deaktivieren' : 'Kameras aktivieren'}
        >
          {sendVideo ? <FaVideo size="24px"/> : <FaVideoSlash size="24px"/>}
        </PrimaryButton>
        <PrimaryButton
          className={styles.button}
          round
          toggled={sendAudio}
          onClick={() => {
            devices
              .filter(device => device.canAudio)
              .forEach(device => connection.emit(ClientDeviceEvents.ChangeDevice, {
                _id: device._id,
                sendAudio: !sendAudio
              } as ClientDevicePayloads.ChangeDevice))
          }}
          title={sendAudio ? 'Mikrofone deaktivieren' : 'Mikrofone aktivieren'}
        >
          {sendAudio ? <FaMicrophone size="24px"/> : <FaMicrophoneSlash size="24px"/>}
        </PrimaryButton>
      </div>
    )
  }
  return null;
}
export default GlobalDeviceController
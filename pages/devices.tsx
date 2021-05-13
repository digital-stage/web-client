import {useStageSelector} from '@digitalstage/api-client-react'
import React from 'react'
import DevicePanel from '../components/devices/DevicePanel'
import styles from '../styles/Devices.module.css'

const Devices = () => {
  const ready = useStageSelector<boolean>((state) => state.globals.ready)
  const localDeviceId = useStageSelector(state => state.globals.localDeviceId)
  const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds.filter(id => id !== localDeviceId))

  if (ready) {
    return (
      <div className={styles.wrapper}>
        <h1>Dieses Gerät</h1>
        <div className={styles.column}>
          <div className={styles.device}>
            <DevicePanel id={localDeviceId}/>
          </div>
        </div>
        <h1>Meine Geräte</h1>
        <div className={styles.columns}>
          {deviceIds.map((deviceId) => (
            <div key={deviceId} className={styles.column}>
              <div className={styles.device}>
                <DevicePanel id={deviceId}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return <div>Loading</div>
}
export default Devices

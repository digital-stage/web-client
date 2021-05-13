import React from 'react'
import {
  ClientDeviceEvents,
  Device,
  MediasoupDevice,
  useConnection,
  useStageSelector,
} from '@digitalstage/api-client-react'
import SoundCardSelect from '../settings/SoundCardSelect'
import SecondaryButton from '../../ui/button/SecondaryButton'
import Input from "../../ui/form/Input";
import LiveInput from "../../ui/form/LiveInput";
import {ClientDevicePayloads} from "@digitalstage/api-types";

const MediasoupSettings = (props: { device: MediasoupDevice }) => {
  const {device} = props
  const connection = useConnection()
  return (
    <>
      {device.canVideo && (
        <li>
          Input video:
          <select
            value={device.inputVideoDeviceId}
            onChange={(event) =>
              connection.emit(ClientDeviceEvents.ChangeDevice, {
                _id: device._id,
                inputVideoDeviceId: event.currentTarget.value,
              })
            }
          >
            {device.inputVideoDevices.map((inputVideoDevice) => (
              <option key={inputVideoDevice.id} value={inputVideoDevice.id}>
                {inputVideoDevice.label}
              </option>
            ))}
          </select>
        </li>
      )}
      {device.canAudio && (
        <>
          <li>
            Input audio:
            <select
              value={device.inputAudioDeviceId}
              onChange={(event) =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  inputAudioDeviceId: event.currentTarget.value,
                })
              }
            >
              {device.inputAudioDevices.map((inputAudioDevice) => (
                <option key={inputAudioDevice.id} value={inputAudioDevice.id}>
                  {inputAudioDevice.label}
                </option>
              ))}
            </select>
          </li>
          <li>
            Output audio:
            <select
              value={device.outputAudioDeviceId}
              onChange={(event) =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  outputAudioDeviceId: event.currentTarget.value,
                })
              }
            >
              {device.outputAudioDevices.map((outputAudioDevice) => (
                <option key={outputAudioDevice.id} value={outputAudioDevice.id}>
                  {outputAudioDevice.label}
                </option>
              ))}
            </select>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={device.autoGainControl || false}
                onChange={(event) =>
                  connection.emit(ClientDeviceEvents.ChangeDevice, {
                    _id: device._id,
                    autoGainControl: event.currentTarget.checked,
                  })
                }
              />
              autoGainControl
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={device.echoCancellation || false}
                onChange={(event) =>
                  connection.emit(ClientDeviceEvents.ChangeDevice, {
                    _id: device._id,
                    echoCancellation: event.currentTarget.checked,
                  })
                }
              />
              echoCancellation
            </label>
          </li>
          <li>
            <label>
              <input
                type="checkbox"
                checked={device.noiseSuppression || false}
                onChange={(event) =>
                  connection.emit(ClientDeviceEvents.ChangeDevice, {
                    _id: device._id,
                    noiseSuppression: event.currentTarget.checked,
                  })
                }
              />
              noiseSuppression
            </label>
          </li>
        </>
      )}
    </>
  )
}

const DevicePanel = (props: { id: string }) => {
  const {id: deviceId} = props
  const device = useStageSelector<Device>((state) => state.devices.byId[deviceId])
  const connection = useConnection()

  return (
    <>
      <h4>
        <LiveInput onChange={value => connection.emit(ClientDeviceEvents.ChangeDevice, {
          _id: deviceId,
          name: value
        } as ClientDevicePayloads.ChangeDevice)} label="Name" value={device.name}/>
      </h4>
      {device.online ? <strong>{device.type}</strong> : <i>{device.type}</i>}
      {device.type === 'mediasoup' && (
        <MediasoupSettings device={device as MediasoupDevice}/>
      )}
      {(device.type === 'ov' || device.type === 'jammer') && (
        <SoundCardSelect deviceId={deviceId}/>
      )}
      <ul>
        {device.canVideo && (
          <li>
            Send video:{' '}
            <SecondaryButton
              onClick={() =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  sendVideo: !device.sendVideo,
                })
              }
            >
              {device.sendVideo ? 'YES' : 'NO'}
            </SecondaryButton>
          </li>
        )}
        {device.canAudio && (
          <li>
            Send audio:{' '}
            <SecondaryButton
              onClick={() =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  sendAudio: !device.sendAudio,
                })
              }
            >
              {device.sendAudio ? 'YES' : 'NO'}
            </SecondaryButton>
          </li>
        )}
        {device.canVideo && (
          <li>
            Receive video:{' '}
            <SecondaryButton
              onClick={() =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  receiveVideo: !device.receiveVideo,
                })
              }
            >
              {device.receiveVideo ? 'YES' : 'NO'}
            </SecondaryButton>
          </li>
        )}
        {device.canAudio && (
          <li>
            Receive audio:{' '}
            <SecondaryButton
              onClick={() =>
                connection.emit(ClientDeviceEvents.ChangeDevice, {
                  _id: device._id,
                  receiveAudio: !device.receiveAudio,
                })
              }
            >
              {device.receiveAudio ? 'YES' : 'NO'}
            </SecondaryButton>
          </li>
        )}
      </ul>
    </>
  )
}
export default DevicePanel

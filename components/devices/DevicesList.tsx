/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {
  selectDevice,
  useEmit
} from '@digitalstage/api-client-react'
import {useDispatch} from 'react-redux'
import React from 'react'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import {List, ListItem} from 'ui/List'
import {Switch} from 'ui/Switch'
import {MdEdit, MdMic, MdMicOff, MdVideocam, MdVideocamOff} from 'react-icons/md'
import {GoBrowser, GoDeviceDesktop} from 'react-icons/go'
import {FaRaspberryPi, FaTrash} from 'react-icons/fa'
import {DeleteModal} from './DeleteModal'
import {useTrackedSelector} from "../../api/redux/selectors/useTrackedSelector";

const TypeIcons = {
  jammer: <GoDeviceDesktop/>,
  ov: <FaRaspberryPi/>,
  browser: <GoBrowser/>,
  mediasoup: <GoBrowser/>,
}

const DeviceEntry = ({
                       deviceId,
                       localDeviceId,
                       onSelect,
                       onDeleteClicked,
                     }: {
  deviceId: string
  localDeviceId: string
  onSelect: () => void
  onDeleteClicked: () => void
}) => {
  const state = useTrackedSelector()
  const {selectedDeviceId} = state.globals
  const device = state.devices.byId[deviceId]
  const selected = React.useMemo(() => selectedDeviceId === deviceId, [deviceId, selectedDeviceId])
  const emit = useEmit()

  if (emit && device) {
    return (
      <ListItem
        onSelect={onSelect}
        selected={selected}
        className={deviceId === localDeviceId ? 'deviceSelected' : undefined}
      >
        <div className="deviceCaption">
          {TypeIcons[device.type]}
          {device.name ||
          (device.type === 'browser'
            ? `${device.os}: ${device.browser}`
            : device._id)}{' '}
          {localDeviceId === device._id ? '(Dieser Webbrowser)' : ''}
        </div>
        <div
          className="deviceActions"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          {device?.type === 'browser' ? (
            <label className="deviceLabel">
              P2P&nbsp;
              <Switch
                size="small"
                round
                checked={device.useP2P}
                onChange={(e) =>
                  emit(ClientDeviceEvents.ChangeDevice, {
                    _id: device._id,
                    useP2P: e.currentTarget.checked,
                  } as ClientDevicePayloads.ChangeDevice)
                }
              />
            </label>
          ) : null}
          {device?.canVideo ? (
            <button
              className="round secondary small"
              onClick={() =>
                emit(ClientDeviceEvents.ChangeDevice, {
                  _id: deviceId,
                  sendVideo: !device.sendVideo,
                })
              }
            >
              {device.sendVideo ? <MdVideocam/> : <MdVideocamOff/>}
            </button>
          ) : null}
          {device?.canAudio ? (
            <button
              onClick={() =>
                emit(ClientDeviceEvents.ChangeDevice, {
                  _id: deviceId,
                  sendAudio: !device.sendAudio,
                } as ClientDevicePayloads.ChangeDevice)
              }
              className="round small secondary"
            >
              {device.sendAudio ? <MdMic/> : <MdMicOff/>}
            </button>
          ) : null}
          <Link href={`/devices/${deviceId}`} passHref>
            <button className="round small">
              <MdEdit/>
            </button>
          </Link>
          {!device.online ? (
            <button className="round small danger" onClick={onDeleteClicked}>
              <FaTrash/>
            </button>
          ) : undefined}
        </div>
      </ListItem>
    )
  }
  return null
}

const DevicesList = (): JSX.Element | null => {
  const state = useTrackedSelector()
  const deviceIds = state.devices.allIds
  const {localDeviceId} = state.globals
  const dispatch = useDispatch()
  const {selectedDeviceId} = state.globals
  const [deleteRequest, requestDelete] = React.useState<string>()
  const {push} = useRouter()

  if (localDeviceId) {
    return (
      <List className="devicesList">
        {deviceIds.map((deviceId) => (
          <DeviceEntry
            key={deviceId}
            deviceId={deviceId}
            localDeviceId={localDeviceId}
            onSelect={() => {
              if (selectedDeviceId === deviceId) {
                push(`/devices/${deviceId}`)
              } else {
                dispatch(selectDevice(deviceId))
              }
            }}
            onDeleteClicked={() => requestDelete(deviceId)}
          />
        ))}
        {deleteRequest && <DeleteModal deviceId={deleteRequest} onClose={() => requestDelete(undefined)}/>}
      </List>
    )
  }
  return null
}
export {DevicesList}

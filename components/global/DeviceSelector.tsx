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

import React from 'react'
import {Select} from 'ui/Select'
import {
  useEmit,
  selectDevice,
  useTrackedSelector,
  selectReady,
  selectLocalDeviceId, selectCurrentStageId
} from '@digitalstage/api-client-react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import {useDispatch} from 'react-redux'
import {MdMic, MdMicOff, MdVideocam, MdVideocamOff} from 'react-icons/md'
import {ImExit} from 'react-icons/im'

const DeviceSelector = ({
                          className,
                          ...props
                        }: Omit<React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  'children'>) => {
  const emit = useEmit()
  const dispatch = useDispatch()
  const state = useTrackedSelector()
  const ready = selectReady(state)
  const localDeviceId = selectLocalDeviceId(state)
  const insideStage = !!selectCurrentStageId(state)
  const devices = state.devices.allIds.map((id) => state.devices.byId[id])
  const selectedDevice = state.globals.selectedDeviceId
    ? state.devices.byId[state.globals.selectedDeviceId]
    : undefined

  if (ready && emit) {
    return (
      <div
        className={`deviceSelector large ${className || ''}`}
        {...props}
      >
        {devices.length > 1 && (
          <div className="deviceSelectorItem">
            <Select
              className="select"
              value={selectedDevice?._id}
              onChange={(event) => {
                dispatch(selectDevice(event.currentTarget.value))
              }}
            >
              {devices.map((device) => {
                const name = device.name
                  ? device.name
                  : device.type === 'browser'
                    ? `${device.browser} (${device.os})`
                    : device._id
                return (
                  <option key={device._id} value={device._id}>
                    {localDeviceId === device._id ? `Dieses Gerät` : `${name}`}
                  </option>
                )
              })}
            </Select>
          </div>
        )}
        {selectedDevice?.canVideo ? (
          <>
            <button
              className="round secondary"
              onClick={() =>
                emit(ClientDeviceEvents.ChangeDevice, {
                  _id: selectedDevice._id,
                  sendVideo: !selectedDevice.sendVideo,
                })
              }
            >
              {selectedDevice.sendVideo ? <MdVideocam/> : <MdVideocamOff/>}
            </button>
          </>
        ) : null}
        {selectedDevice?.canAudio ? (
          <button
            onClick={() =>
              emit(ClientDeviceEvents.ChangeDevice, {
                _id: selectedDevice._id,
                sendAudio: !selectedDevice.sendAudio,
              } as ClientDevicePayloads.ChangeDevice)
            }
            className="round secondary"
          >
            {selectedDevice.sendAudio ? <MdMic/> : <MdMicOff/>}
          </button>
        ) : null}
        {insideStage ? (
          <button
            className="round danger"
            onClick={() => emit(ClientDeviceEvents.LeaveStage)}
          >
            <ImExit/>
          </button>
        ) : null}
      </div>
    )
  }
  return null
}
export {DeviceSelector}

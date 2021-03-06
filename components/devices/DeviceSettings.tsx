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

import {useEmit, useTrackedSelector} from '../../client'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import React from 'react'
import {LiveInput} from 'ui/LiveInput'
import {Switch} from 'ui/Switch'
import {Select} from 'ui/Select'
import {Paragraph} from 'ui/Paragraph'
import {OptionsList, OptionsListItem} from 'ui/OptionsList'
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";
import {Heading4} from "../../ui/Heading";
import {SoundCardSelect} from './SoundCardSelect'
import {toString} from "lodash";

const DeviceSettings = ({deviceId}: { deviceId: string }): JSX.Element | null => {
  const state = useTrackedSelector()
  const device = React.useMemo(() => state.devices.byId[deviceId], [state.devices.byId, deviceId])
  const emit = useEmit()
  const browserDevice = state.devices.byId[deviceId].type === "browser" && device as BrowserDevice
  if (emit) {
    return (
      <>
        <LiveInput
          onChange={(value) =>
            emit(ClientDeviceEvents.ChangeDevice, {
              _id: deviceId,
              name: value,
            } as ClientDevicePayloads.ChangeDevice)
          }
          label="Name"
          value={
            device?.name ||
            (device?.type === 'browser' ? `${state.devices.byId[deviceId].os}: ${state.devices.byId[deviceId].browser}` : device?._id)
          }
        />
        <OptionsList>
          {device?.type === 'browser' ? (
            <>
              <Heading4>Verbindungseinstellungen</Heading4>
              <OptionsListItem as={<label/>}>
                Direktverbindungen verwenden (schneller)
                <Switch
                  round
                  checked={!!state.devices.byId[deviceId].useP2P}
                  onChange={(e) =>
                    emit(ClientDeviceEvents.ChangeDevice, {
                      _id: deviceId,
                      useP2P: e.currentTarget.checked,
                    } as ClientDevicePayloads.ChangeDevice)
                  }
                />
                <Paragraph kind="micro">
                  Direktverbindungen erm??glichen geringere Latenz und garantieren die
                  schnellstm??gliche Verbindung. Jedoch steigt mit Zunahme der
                  Teilnehmer die Bandbreite stark an, weshalb sich Direktverbindungen
                  nur mit maximal 10 Teilnehmern empfehlen. Au??erdem unterst??tzten
                  viele Internetanschl??sse keine Direktverbindungen. Im Fall von
                  Problemen (kein Sound / Bild anderer Teilnehmer) bitte diese Option
                  deaktivieren.
                </Paragraph>
              </OptionsListItem>
            </>
          ) : null}

          {device?.canVideo ? (
            <>
              <Heading4>Videoeinstellungen</Heading4>
              <OptionsListItem as={<label/>}>
                Video senden
                <Switch
                  round
                  checked={state.devices.byId[deviceId].sendVideo}
                  onChange={(e) =>
                    emit(ClientDeviceEvents.ChangeDevice, {
                      _id: deviceId,
                      sendVideo: e.currentTarget.checked,
                    } as ClientDevicePayloads.ChangeDevice)
                  }
                />
              </OptionsListItem>
              <OptionsListItem as={<label/>}>
                Video empfangen
                <Switch
                  round
                  checked={state.devices.byId[deviceId].receiveVideo}
                  onChange={(e) =>
                    emit(ClientDeviceEvents.ChangeDevice, {
                      _id: deviceId,
                      receiveVideo: e.currentTarget.checked,
                    } as ClientDevicePayloads.ChangeDevice)
                  }
                />
              </OptionsListItem>
              {browserDevice && (
                <OptionsListItem as={<label/>}>
                  Video-Eingabeger??t
                  <Select
                    value={state.devices.byId[deviceId].inputVideoDeviceId}
                    onChange={(event) =>
                      emit(ClientDeviceEvents.ChangeDevice, {
                        _id: state.devices.byId[deviceId]._id,
                        inputVideoDeviceId: event.currentTarget.value,
                      })
                    }
                  >
                    {browserDevice.inputVideoDevices.map((inputVideoDevice) => (
                      <option
                        key={inputVideoDevice.id}
                        value={inputVideoDevice.id}
                      >
                        {inputVideoDevice.label}
                      </option>
                    ))}
                  </Select>
                </OptionsListItem>
              )}
            </>
          ) : null}
          {device?.canAudio ? (
            <>
              <Heading4>Audioeinstellungen</Heading4>
              <OptionsListItem as={<label/>}>
                Audio senden
                <Switch
                  round
                  checked={state.devices.byId[deviceId].sendAudio}
                  onChange={(e) =>
                    emit(ClientDeviceEvents.ChangeDevice, {
                      _id: deviceId,
                      sendAudio: e.currentTarget.checked,
                    } as ClientDevicePayloads.ChangeDevice)
                  }
                />
              </OptionsListItem>
              <OptionsListItem as={<label/>}>
                Audio empfangen
                <Switch
                  round
                  checked={state.devices.byId[deviceId].receiveAudio}
                  onChange={(e) =>
                    emit(ClientDeviceEvents.ChangeDevice, {
                      _id: deviceId,
                      receiveAudio: e.currentTarget.checked,
                    } as ClientDevicePayloads.ChangeDevice)
                  }
                />
              </OptionsListItem>

              {browserDevice ? (
                <>
                  <OptionsListItem as={<label/>}>
                    Audio-Eingabeger??t
                    <Select
                      value={state.devices.byId[deviceId].inputAudioDeviceId}
                      onChange={(event) =>
                        emit(ClientDeviceEvents.ChangeDevice, {
                          _id: state.devices.byId[deviceId]._id,
                          inputAudioDeviceId: event.currentTarget.value,
                        })
                      }
                    >
                      {browserDevice.inputAudioDevices.map((inputAudioDevice) => (
                        <option
                          key={inputAudioDevice.id}
                          value={inputAudioDevice.id}
                        >
                          {inputAudioDevice.label}
                        </option>
                      ))}
                    </Select>
                  </OptionsListItem>
                  <OptionsListItem as={<label/>} kind="sub">
                    Automatisch pegeln
                    <Switch
                      size="small"
                      round
                      checked={state.devices.byId[deviceId].autoGainControl || false}
                      onChange={(event) =>
                        emit(ClientDeviceEvents.ChangeDevice, {
                          _id: state.devices.byId[deviceId]._id,
                          autoGainControl: event.currentTarget.checked,
                        })
                      }
                    />
                  </OptionsListItem>
                  <OptionsListItem as={<label/>} kind="sub">
                    Feedback unterdr??cken
                    <Switch
                      size="small"
                      round
                      checked={state.devices.byId[deviceId].echoCancellation || false}
                      onChange={(event) =>
                        emit(ClientDeviceEvents.ChangeDevice, {
                          _id: state.devices.byId[deviceId]._id,
                          echoCancellation: event.currentTarget.checked,
                        })
                      }
                    />
                  </OptionsListItem>
                  <OptionsListItem as={<label/>} kind="sub">
                    Hintergrundger??usche eliminieren
                    <Switch
                      size="small"
                      round
                      checked={state.devices.byId[deviceId].noiseSuppression || false}
                      onChange={(event) =>
                        emit(ClientDeviceEvents.ChangeDevice, {
                          _id: state.devices.byId[deviceId]._id,
                          noiseSuppression: event.currentTarget.checked,
                        })
                      }
                    />
                  </OptionsListItem>
                  {/*<OptionsListItem as={<label/>} kind="sub">
                    Audio-Ausgabeger??t
                    <Select
                      value={state.devices.byId[deviceId].outputAudioDeviceId}
                      onChange={(event) =>
                        emit(ClientDeviceEvents.ChangeDevice, {
                          _id: state.devices.byId[deviceId]._id,
                          outputAudioDeviceId: event.currentTarget.value,
                        })
                      }
                    >
                      {browserDevice.outputAudioDevices.map((outputAudioDevice) => (
                        <option
                          key={outputAudioDevice.id}
                          value={outputAudioDevice.id}
                        >
                          {outputAudioDevice.label}
                        </option>
                      ))}
                    </Select>
                  </OptionsListItem>*/}
                </>
              ) : (
                <>
                  <OptionsListItem as={<label/>}>
                    Gr????e des Empf??ngerzwischenspeichers
                    <LiveInput
                      type="number"
                      min={512}
                      step={256}
                      max={20480}
                      label="Gr????e in Samples"
                      value={toString(device.buffer)}
                      onChange={(v) => {
                        const buffer = parseInt(v)
                        if (Number.isInteger(buffer)) {
                          emit(ClientDeviceEvents.ChangeDevice, {
                            _id: deviceId,
                            buffer: buffer
                          } as ClientDevicePayloads.ChangeDevice)
                        }
                      }}/>
                  </OptionsListItem>
                  <OptionsListItem style={{
                    alignItems: 'flex-start'
                  }}>
                                          <span style={{
                                            paddingTop: '16px',
                                            paddingBottom: '16px',
                                          }}>
                                          Audio-Eingabeger??t
                                          </span>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <SoundCardSelect type="input" deviceId={deviceId}/>
                    </div>
                  </OptionsListItem>
                  <OptionsListItem style={{
                    alignItems: 'flex-start'
                  }}>
                                          <span style={{
                                            paddingTop: '16px',
                                            paddingBottom: '16px',
                                          }}>
                                          Audio-Ausgabeger??t
                                          </span>
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <SoundCardSelect type="output" deviceId={deviceId}/>
                    </div>
                  </OptionsListItem>

                </>
              )}
            </>
          ) : null}
        </OptionsList>
      </>
    )
  }
  return null
}
export {DeviceSettings}

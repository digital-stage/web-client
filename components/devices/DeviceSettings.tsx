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

import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import React from 'react'
import { shallowEqual } from 'react-redux'
import {LiveInput} from 'ui/LiveInput'
import { Switch } from 'ui/Switch'
import { Select } from 'ui/Select'
import {SoundCardSettings} from './SoundCardSettings'
import { Paragraph } from 'ui/Paragraph'
import { OptionsList, OptionsListItem  } from 'ui/OptionsList'

const DeviceSettings = ({ deviceId }: { deviceId: string }) => {
    const device = useStageSelector((state) => state.devices.byId[deviceId], shallowEqual)
    const emit = useEmit()
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
                    (device?.type === 'browser' ? `${device.os}: ${device.browser}` : device?._id)
                }
            />
            <OptionsList>
                {device?.type === 'browser' ? (
                    <>
                        <h4>Verbindungseinstellungen</h4>
                        <OptionsListItem as={<label />}>
                            Direktverbindungen verwenden (schneller)
                            <Switch
                                round={true}
                                checked={!!device.useP2P}
                                onChange={(e) =>
                                    emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: deviceId,
                                        useP2P: e.currentTarget.checked,
                                    } as ClientDevicePayloads.ChangeDevice)
                                }
                            />
                            <Paragraph kind="micro">
                                Direktverbindungen ermöglichen geringere Latenz und garantieren die
                                schnellstmögliche Verbindung. Jedoch steigt mit Zunahme der
                                Teilnehmer die Bandbreite stark an, weshalb sich Direktverbindungen
                                nur mit maximal 10 Teilnehmern empfehlen. Außerdem unterstützten
                                viele Internetanschlüsse keine Direktverbindungen. Im Fall von
                                Problemen (kein Sound / Bild anderer Teilnehmer) bitte diese Option
                                deaktivieren.
                            </Paragraph>
                        </OptionsListItem>
                    </>
                ) : null}

                {device?.canVideo ? (
                    <>
                        <h4>Videoeinstellungen</h4>
                        <OptionsListItem as={<label />}>
                            Video senden
                            <Switch
                                round={true}
                                checked={device.sendVideo}
                                onChange={(e) =>
                                    emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: deviceId,
                                        sendVideo: e.currentTarget.checked,
                                    } as ClientDevicePayloads.ChangeDevice)
                                }
                            />
                        </OptionsListItem>
                        <OptionsListItem as={<label />}>
                            Video empfangen
                            <Switch
                                round={true}
                                checked={device.receiveVideo}
                                onChange={(e) =>
                                    emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: deviceId,
                                        receiveVideo: e.currentTarget.checked,
                                    } as ClientDevicePayloads.ChangeDevice)
                                }
                            />
                        </OptionsListItem>
                        {device.type === 'browser' ? (
                            <OptionsListItem as={<label />}>
                                Video-Eingabegerät
                                <Select
                                    value={device.inputVideoDeviceId}
                                    onChange={(event) =>
                                        emit(ClientDeviceEvents.ChangeDevice, {
                                            _id: device._id,
                                            inputVideoDeviceId: event.currentTarget.value,
                                        })
                                    }
                                >
                                    {device.inputVideoDevices.map((inputVideoDevice) => (
                                        <option
                                            key={inputVideoDevice.id}
                                            value={inputVideoDevice.id}
                                        >
                                            {inputVideoDevice.label}
                                        </option>
                                    ))}
                                </Select>
                            </OptionsListItem>
                        ) : null}
                    </>
                ) : null}
                {device?.canAudio ? (
                    <>
                        <h4>Audioeinstellungen</h4>
                        <OptionsListItem as={<label />}>
                            Audio senden
                            <Switch
                                round={true}
                                checked={device.sendAudio}
                                onChange={(e) =>
                                    emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: deviceId,
                                        sendAudio: e.currentTarget.checked,
                                    } as ClientDevicePayloads.ChangeDevice)
                                }
                            />
                        </OptionsListItem>
                        <OptionsListItem as={<label />}>
                            Audio empfangen
                            <Switch
                                round={true}
                                checked={device.receiveAudio}
                                onChange={(e) =>
                                    emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: deviceId,
                                        receiveAudio: e.currentTarget.checked,
                                    } as ClientDevicePayloads.ChangeDevice)
                                }
                            />
                        </OptionsListItem>

                        {device.type === 'browser' ? (
                            <>
                                <OptionsListItem as={<label />}>
                                    Audio-Eingabegerät
                                    <Select
                                        value={device.inputAudioDeviceId}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                inputAudioDeviceId: event.currentTarget.value,
                                            })
                                        }
                                    >
                                        {device.inputAudioDevices.map((inputAudioDevice) => (
                                            <option
                                                key={inputAudioDevice.id}
                                                value={inputAudioDevice.id}
                                            >
                                                {inputAudioDevice.label}
                                            </option>
                                        ))}
                                    </Select>
                                </OptionsListItem>
                                <OptionsListItem as={<label />} kind="sub">
                                    Automatisch pegeln
                                    <Switch
                                        size="small"
                                        round
                                        checked={device.autoGainControl || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                autoGainControl: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </OptionsListItem>
                                <OptionsListItem as={<label />} kind="sub">
                                    Feedback unterdrücken
                                    <Switch
                                        size="small"
                                        round
                                        checked={device.echoCancellation || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                echoCancellation: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </OptionsListItem>
                                <OptionsListItem as={<label />} kind="sub">
                                    Hintergrundgeräusche eliminieren
                                    <Switch
                                        size="small"
                                        round
                                        checked={device.noiseSuppression || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                noiseSuppression: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </OptionsListItem>
                                <OptionsListItem as={<label />} kind="sub">
                                    Audio-Ausgabegerät
                                    <Select
                                        value={device.outputAudioDeviceId}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                outputAudioDeviceId: event.currentTarget.value,
                                            })
                                        }
                                    >
                                        {device.outputAudioDevices.map((outputAudioDevice) => (
                                            <option
                                                key={outputAudioDevice.id}
                                                value={outputAudioDevice.id}
                                            >
                                                {outputAudioDevice.label}
                                            </option>
                                        ))}
                                    </Select>
                                </OptionsListItem>
                            </>
                        ) : (
                            <SoundCardSettings deviceId={deviceId} />
                        )}
                    </>
                ) : null}
            </OptionsList>
        </>
    )
}
export {DeviceSettings}

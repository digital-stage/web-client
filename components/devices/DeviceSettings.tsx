import { useConnection, useStageSelector } from '@digitalstage/api-client-react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import React from 'react'
import { shallowEqual } from 'react-redux'
import LiveInput from 'ui/LiveInput'
import Switch from '../../ui/Switch'
import styles from './DeviceSettings.module.scss'
import Select from '../../ui/Select'
import SoundCardSettings from './SoundCardSettings'
import Paragraph from '../../ui/Paragraph'

const DeviceSettings = ({ deviceId }: { deviceId: string }) => {
    const device = useStageSelector((state) => state.devices.byId[deviceId], shallowEqual)
    const { emit } = useConnection()
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
            <ul className={styles.settings}>
                {device?.type === 'browser' ? (
                    <>
                        <h4>Verbindungseinstellungen</h4>
                        <label className={styles.setting}>
                            Direktverbindungen verwenden (schneller)
                            <Switch
                                round={true}
                                checked={device.useP2P}
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
                        </label>
                    </>
                ) : null}

                {device?.canVideo ? (
                    <>
                        <h4>Videoeinstellungen</h4>
                        <label className={styles.setting}>
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
                        </label>
                        <label className={styles.setting}>
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
                        </label>
                        {device.type === 'browser' ? (
                            <label className={styles.setting}>
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
                            </label>
                        ) : null}
                    </>
                ) : null}
                {device?.canAudio ? (
                    <>
                        <h4>Audioeinstellungen</h4>
                        <label className={styles.setting}>
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
                        </label>
                        <label className={styles.setting}>
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
                        </label>

                        {device.type === 'browser' ? (
                            <>
                                <label className={styles.setting}>
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
                                </label>
                                <label className={`${styles.setting} ${styles.sub}`}>
                                    Automatisch pegeln
                                    <Switch
                                        round
                                        checked={device.autoGainControl || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                autoGainControl: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </label>
                                <label className={`${styles.setting} ${styles.sub}`}>
                                    Feedback unterdrücken
                                    <Switch
                                        round
                                        checked={device.echoCancellation || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                echoCancellation: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </label>
                                <label className={`${styles.setting} ${styles.sub}`}>
                                    Hintergrundgeräusche eliminieren
                                    <Switch
                                        round
                                        checked={device.noiseSuppression || false}
                                        onChange={(event) =>
                                            emit(ClientDeviceEvents.ChangeDevice, {
                                                _id: device._id,
                                                noiseSuppression: event.currentTarget.checked,
                                            })
                                        }
                                    />
                                </label>
                                <label className={styles.setting}>
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
                                </label>
                            </>
                        ) : (
                            <SoundCardSettings deviceId={deviceId} />
                        )}
                    </>
                ) : null}
            </ul>
        </>
    )
}
export default DeviceSettings

import {
    ClientDeviceEvents,
    SoundCard,
    useConnection,
    useStageSelector,
} from '@digitalstage/api-client-react'
import React from 'react'
import { Device } from '@digitalstage/api-types'

const ChannelSelector = (props: { id: string }) => {
    const { id } = props
    const soundCard = useStageSelector<SoundCard>((state) => state.soundCards.byId[id])
    const connection = useConnection()
    if (!soundCard) return null
    return (
        <ul>
            <li>
                Input channels ({Object.keys(soundCard.inputChannels).length})
                <ul>
                    {Object.keys(soundCard.inputChannels).map((channelName) => (
                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={soundCard.inputChannels[channelName]}
                                    onChange={(event) =>
                                        connection.emit(ClientDeviceEvents.ChangeSoundCard, {
                                            _id: soundCard._id,
                                            inputChannels: {
                                                ...soundCard.inputChannels,
                                                [channelName]: event.currentTarget.checked,
                                            },
                                        })
                                    }
                                />
                                {channelName}
                            </label>
                        </li>
                    ))}
                </ul>
            </li>
            <li>
                Output channels:
                <ul>
                    {Object.keys(soundCard.outputChannels).map((channelName) => (
                        <li>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={soundCard.outputChannels[channelName]}
                                    onChange={(event) =>
                                        connection.emit(ClientDeviceEvents.ChangeSoundCard, {
                                            _id: soundCard._id,
                                            outputChannels: {
                                                ...soundCard.outputChannels,
                                                [channelName]: event.currentTarget.checked,
                                            },
                                        })
                                    }
                                />
                                {channelName}
                            </label>
                        </li>
                    ))}
                </ul>
            </li>
        </ul>
    )
}

const SoundCardSelect = (props: { deviceId: string }) => {
    const { deviceId } = props
    const device = useStageSelector<Device>((state) => state.devices.byId[deviceId])
    const soundCards = useStageSelector<SoundCard[]>((state) =>
        state.soundCards.byDevice[device._id]
            ? state.soundCards.byDevice[device._id].map(
                  (soundCardId) => state.soundCards.byId[soundCardId]
              )
            : []
    )
    const connection = useConnection()

    return (
        <>
            <select
                onChange={(event) => {
                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                        _id: deviceId,
                        soundCardId: event.currentTarget.value,
                    })
                }}
                value={device.soundCardId || ''}
            >
                <option disabled value="">
                    --- Please select a sound card ---
                </option>
                {soundCards.map((soundCard) => (
                    <option key={soundCard._id} value={soundCard._id}>
                        {soundCard.label} ({soundCard.uuid})
                    </option>
                ))}
            </select>
            {device.soundCardId && <ChannelSelector id={device.soundCardId} />}
        </>
    )
}
export default SoundCardSelect

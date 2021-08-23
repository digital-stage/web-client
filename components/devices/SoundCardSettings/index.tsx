import { ClientDeviceEvents, Device, SoundCard } from '@digitalstage/api-types'
import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import { shallowEqual } from 'react-redux'
import Switch from '../../../ui/Switch'
import Select from '../../../ui/Select'

const ChannelSelector = ({ soundCardId }: { soundCardId: string }) => {
    const soundCard = useStageSelector<SoundCard>(
        (state) => state.soundCards.byId[soundCardId],
        shallowEqual
    )
    const emit = useEmit()
    if (!soundCard) return null
    return (
        <ul>
            <li>
                {Object.keys(soundCard.inputChannels).length} Eingangskanäle:
                <ul>
                    {Object.keys(soundCard.inputChannels).map((channelName) => (
                        <li key={channelName}>
                            <label>
                                <Switch
                                    checked={soundCard.inputChannels[channelName]}
                                    onChange={(event) =>
                                        emit(ClientDeviceEvents.ChangeSoundCard, {
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
                {Object.keys(soundCard.outputChannels).length} Ausgangskanäle:
                <ul>
                    {Object.keys(soundCard.outputChannels).map((channelName) => (
                        <li key={channelName}>
                            <label>
                                <Switch
                                    checked={soundCard.outputChannels[channelName]}
                                    onChange={(event) =>
                                        emit(ClientDeviceEvents.ChangeSoundCard, {
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
const SoundCardSettings = ({ deviceId }: { deviceId: string }) => {
    const device = useStageSelector<Device>((state) => state.devices.byId[deviceId])
    const emit = useEmit()
    const soundCards = useStageSelector<SoundCard[]>((state) =>
        state.soundCards.byDevice[device._id]
            ? state.soundCards.byDevice[device._id].map(
                  (soundCardId) => state.soundCards.byId[soundCardId]
              )
            : []
    )

    return (
        <>
            <Select
                onChange={(event) => {
                    emit(ClientDeviceEvents.ChangeDevice, {
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
            </Select>
            {device.soundCardId && <ChannelSelector soundCardId={device.soundCardId} />}
        </>
    )
}
export default SoundCardSettings

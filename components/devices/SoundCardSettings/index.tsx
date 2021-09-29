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

import {ClientDeviceEvents, Device, SoundCard} from '@digitalstage/api-types'
import {useEmit, useStageSelector} from '@digitalstage/api-client-react'
import {shallowEqual} from 'react-redux'
import {Switch} from 'ui/Switch'
import {Select} from 'ui/Select'

const ChannelSelector = ({soundCardId}: { soundCardId: string }) => {
    const soundCard = useStageSelector<SoundCard>(
        (state) => state.soundCards.byId[soundCardId],
        shallowEqual
    )
    const emit = useEmit()
    if (!soundCard) return null
    return (
        <ul>
            <li>
                {Object.keys(soundCard.channels).length} Eingangskanäle:
                <ul>
                    {Object.keys(soundCard.channels).map((channelName) => (
                        <li key={channelName}>
                            <label>
                                <Switch
                                    checked={soundCard.channels[channelName]}
                                    onChange={(event) =>
                                        emit(ClientDeviceEvents.ChangeSoundCard, {
                                            _id: soundCard._id,
                                            channels: {
                                                ...soundCard.channels,
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
const SoundCardsSelector = ({device, soundCards}: { device: Device, soundCards: SoundCard[] }) => {
    const emit = useEmit()
    return (
        <>
            <Select
                onChange={(event) => {
                    emit(ClientDeviceEvents.ChangeDevice, {
                        _id: device._id,
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
                        {soundCard.label} ({soundCard.audioDriver})
                    </option>
                ))}
            </Select>
            {device.soundCardId && <ChannelSelector soundCardId={device.soundCardId}/>}
        </>
    )
}
const SoundCardSettings = ({deviceId}: { deviceId: string }) => {
    const device = useStageSelector<Device>((state) => state.devices.byId[deviceId])
    const inputSoundCards = useStageSelector<SoundCard[]>((state) =>
        state.soundCards.byDevice[device._id]
            ? state.soundCards.byDevice[device._id].input.map(
                (soundCardId) => state.soundCards.byId[soundCardId]
            )
            : []
    )
    const outputSoundCards = useStageSelector<SoundCard[]>((state) =>
        state.soundCards.byDevice[device._id]
            ? state.soundCards.byDevice[device._id].output.map(
                (soundCardId) => state.soundCards.byId[soundCardId]
            )
            : []
    )
    return (
        <>
            <SoundCardsSelector device={device} soundCards={inputSoundCards}/>
            <SoundCardsSelector device={device} soundCards={outputSoundCards}/>
        </>
    )
}
export {SoundCardSettings}

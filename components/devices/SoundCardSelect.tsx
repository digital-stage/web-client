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
import {RootState, useEmit, useTrackedSelector} from "@digitalstage/api-client-react";
import {ClientDeviceEvents, ClientDevicePayloads, SoundCard} from "@digitalstage/api-types";
import React, {useState} from "react";
import {OptionsList, OptionsListItem} from "ui/OptionsList";
import {Select} from "../../ui/Select";
import {Switch} from "../../ui/Switch";

const selectAudioDriversByDeviceId = (state: RootState, type: "input" | "output", deviceId: string): string[] =>
    [...new Set<string>(
        state.soundCards[type].byDevice[deviceId]
            ? state.soundCards[type].byDevice[deviceId].map(id => state.soundCards.byId[id].audioDriver)
            : []
    )]

const selectInputSoundCardByDeviceId = (state: RootState, deviceId: string): SoundCard | undefined => {
    if (state.devices.byId[deviceId]) {
        const id: string | null = state.devices.byId[deviceId].inputSoundCardId
        if (id) {
            return state.soundCards.byId[id]
        }
    }
    return undefined
}
const selectOutputSoundCardByDeviceId = (state: RootState, deviceId: string): SoundCard | undefined => {
    if (state.devices.byId[deviceId]) {
        const id: string | null = state.devices.byId[deviceId].outputSoundCardId
        if (id) {
            return state.soundCards.byId[id]
        }
    }
    return undefined
}

const selectSoundCardsByDeviceAndTypeAndAudioDriver = (state: RootState, deviceId: string, type: "input" | "output", audioDriver: string) => {
    if (state.soundCards[type].byDeviceAndDriver[deviceId]) {
        if (state.soundCards[type].byDeviceAndDriver[deviceId][audioDriver]) {
            return state.soundCards[type].byDeviceAndDriver[deviceId][audioDriver].map(id => state.soundCards.byId[id])
        }
    }
    return []
}

const ChannelSelector = ({soundCardId}: { soundCardId: string }) => {
    const state = useTrackedSelector()
    const emit = useEmit()
    if (!state.soundCards.byId[soundCardId]) return null
    if (!emit) return null

    return (
        <OptionsList>
            <OptionsListItem style={{
                paddingTop: '8px'
            }}>
                {state.soundCards.byId[soundCardId].type === "input" ? 'Eingangskanäle:' : 'Ausgangskanäle:'}
            </OptionsListItem>
            {state.soundCards.byId[soundCardId].channels.map((channel, index, channels) => (
                <OptionsListItem key={soundCardId + index} as={<label/>}>
                    <Switch
                        round
                        size="small"
                        checked={channel.active}
                        onChange={(event) =>
                            emit(ClientDeviceEvents.ChangeSoundCard, {
                                _id: soundCardId,
                                channels: channels.map((c, i) => {
                                    if (i === index)
                                        c.active = event.currentTarget.checked
                                    return c
                                })
                            })
                        }
                    />
                    {channel.label}
                </OptionsListItem>
            ))}
        </OptionsList>
    )
}

const SoundCardsSelector = ({
                                soundCardId,
                                soundCards,
                                onChange
                            }: { soundCardId?: string, soundCards: SoundCard[], onChange: (soundCardId: string) => void }) => {
    const handleChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        onChange(event.currentTarget.value)
    }, [onChange])
    if (soundCards.length > 0) {
        return (
            <>
                <Select
                    onChange={handleChange}
                    value={soundCardId || ""}
                    label="Soundkarte"
                >
                    <option disabled value="">
                        --- Bitte wähle eine Soundkarte aus ---
                    </option>
                    {soundCards.map((soundCard) => (
                        <option key={soundCard._id} value={soundCard._id}>
                            {soundCard.label} ({soundCard.audioDriver})
                        </option>
                    ))}
                </Select>
                {soundCardId && <ChannelSelector soundCardId={soundCardId}/>}
            </>
        )
    }
    return null
}

const SoundCardSelect = ({deviceId, type}: { deviceId: string, type: "input" | "output" }) => {
    const state = useTrackedSelector()
    const audioDrivers: string[] = selectAudioDriversByDeviceId(state, "input", deviceId)
    const soundCard = type === "input"
        ? selectInputSoundCardByDeviceId(state, deviceId)
        : selectOutputSoundCardByDeviceId(state, deviceId)
    const [audioDriver, setAudioDriver] = useState<string | undefined>(soundCard?.audioDriver);
    const soundCards = audioDriver ? selectSoundCardsByDeviceAndTypeAndAudioDriver(state, deviceId, type, audioDriver) : []
    const onAudioDriverSelected = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
        setAudioDriver(event.currentTarget.value);
    }, []);
    const emit = useEmit()
    const onSoundCardSelected = React.useCallback((soundCardId: string) => {
        if (emit && deviceId && type) {
            if (type == "input") {
                emit(ClientDeviceEvents.ChangeDevice, {
                    _id: deviceId,
                    inputSoundCardId: soundCardId
                } as ClientDevicePayloads.ChangeDevice)
            } else {
                emit(ClientDeviceEvents.ChangeDevice, {
                    _id: deviceId,
                    outputSoundCardId: soundCardId

                } as ClientDevicePayloads.ChangeDevice)
            }
        }
    }, [deviceId, emit, type]);

    return (
        <>
            <Select
                onChange={onAudioDriverSelected}
                value={audioDriver || soundCard?.audioDriver || ''}
                label="Audiotreiber"
            >
                <option disabled value="">
                    --- Bitte wähle einen Audiotreiber aus ---
                </option>
                {audioDrivers.map((audioDriver) => (
                    <option key={audioDriver} value={audioDriver}>
                        {audioDriver}
                    </option>
                ))}
            </Select>
            <SoundCardsSelector soundCardId={soundCard?._id} soundCards={soundCards} onChange={onSoundCardSelected}/>
        </>
    )
}

export {SoundCardSelect}
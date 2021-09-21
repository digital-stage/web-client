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

import omit from 'lodash/omit'
import { SoundCard, ServerDevicePayloads, ServerDeviceEvents } from '@digitalstage/api-types'
import without from 'lodash/without'
import { SoundCards } from '../state/SoundCards'
import { upsert } from '../utils/upsert'

function reduceSoundCards(
    state: SoundCards = {
        byId: {},
        byDevice: {},
        byDeviceAndUUID: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): SoundCards {
    switch (action.type) {
        case ServerDeviceEvents.SoundCardAdded: {
            const soundCard: SoundCard = action.payload as ServerDevicePayloads.SoundCardAdded
            return {
                byId: {
                    ...state.byId,
                    [soundCard._id]: soundCard,
                },
                byDevice: {
                    ...state.byDevice,
                    [soundCard.deviceId]: upsert<string>(
                        state.byDevice[soundCard.deviceId],
                        soundCard._id
                    ),
                },
                byDeviceAndUUID: {
                    ...state.byDeviceAndUUID,
                    [soundCard.deviceId]: {
                        ...state.byDeviceAndUUID[soundCard.deviceId],
                        [soundCard.uuid]: soundCard._id,
                    },
                },
                allIds: upsert<string>(state.allIds, soundCard._id),
            }
        }
        case ServerDeviceEvents.SoundCardChanged: {
            const soundCard = action.payload as ServerDevicePayloads.SoundCardChanged

            return {
                ...state,
                byId: {
                    ...state.byId,
                    [soundCard._id]: {
                        ...state.byId[soundCard._id],
                        ...soundCard,
                    },
                },
            }
        }
        case ServerDeviceEvents.SoundCardRemoved: {
            const removedId: string = action.payload as ServerDevicePayloads.SoundCardRemoved
            const { deviceId, uuid } = state.byId[removedId]
            return {
                ...state,
                byId: omit(state.byId, removedId),
                byDevice: {
                    ...state.byDevice,
                    [deviceId]: without(state.byDevice[deviceId], removedId),
                },
                byDeviceAndUUID: {
                    ...state.byDeviceAndUUID,
                    [deviceId]: omit(state.byDeviceAndUUID[deviceId], uuid),
                },
                allIds: state.allIds.filter((id) => id !== removedId),
            }
        }
        default:
            return state
    }
}

export { reduceSoundCards }

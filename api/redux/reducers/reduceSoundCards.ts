import omit from 'lodash/omit'
import { SoundCard, ServerDevicePayloads, ServerDeviceEvents } from '@digitalstage/api-types'
import without from 'lodash/without'
import SoundCards from '../state/SoundCards'
import upsert from '../utils/upsert'

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

export default reduceSoundCards

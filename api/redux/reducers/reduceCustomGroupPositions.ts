import omit from 'lodash/omit'
import without from 'lodash/without'
import {
    ServerDevicePayloads,
    ServerDeviceEvents,
    CustomGroupPosition,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import CustomGroupPositions from '../state/CustomGroupPositions'
import { InternalActionTypes } from '../actions/InternalActionTypes'

const addCustomGroupPosition = (
    state: CustomGroupPositions,
    customGroup: CustomGroupPosition
): CustomGroupPositions => ({
    ...state,
    byId: {
        ...state.byId,
        [customGroup._id]: customGroup,
    },
    byGroup: {
        ...state.byGroup,
        [customGroup.groupId]: upsert<string>(state.byGroup[customGroup.groupId], customGroup._id),
    },
    byDevice: {
        ...state.byDevice,
        [customGroup.deviceId]: upsert<string>(
            state.byDevice[customGroup.deviceId],
            customGroup._id
        ),
    },
    byDeviceAndGroup: {
        ...state.byDeviceAndGroup,
        [customGroup.deviceId]: {
            ...state.byDeviceAndGroup[customGroup.deviceId],
            [customGroup.groupId]: customGroup._id,
        },
    },
    allIds: upsert<string>(state.allIds, customGroup._id),
})

function reduceCustomGroupPositions(
    state: CustomGroupPositions = {
        byId: {},
        byDevice: {},
        byGroup: {},
        byDeviceAndGroup: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): CustomGroupPositions {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byGroup: {},
                byDeviceAndGroup: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customGroupPositions } = action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customGroupPositions)
                customGroupPositions.forEach((customGroup) => {
                    updatedState = addCustomGroupPosition(updatedState, customGroup)
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomGroupPositionAdded: {
            const customGroup = action.payload as ServerDevicePayloads.CustomGroupPositionAdded
            return addCustomGroupPosition(state, customGroup)
        }
        case ServerDeviceEvents.CustomGroupPositionChanged: {
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [action.payload._id]: {
                        ...state.byId[action.payload._id],
                        ...action.payload,
                    },
                },
            }
        }
        case ServerDeviceEvents.CustomGroupPositionRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { groupId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byGroup: {
                        ...state.byGroup,
                        [groupId]: without(state.byGroup[groupId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndGroup: {
                        ...state.byDeviceAndGroup,
                        [deviceId]: omit(state.byDeviceAndGroup[deviceId], groupId),
                    },
                    allIds: without<string>(state.allIds, id),
                }
            }
            return state
        }
        default:
            return state
    }
}

export default reduceCustomGroupPositions

import omit from 'lodash/omit'
import without from 'lodash/without'
import {
    ServerDevicePayloads,
    ServerDeviceEvents,
    CustomStageMemberPosition,
} from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import CustomStageMemberPositions from '../state/CustomStageMemberPositions'

const addCustomStageMemberPosition = (
    state: CustomStageMemberPositions,
    customStageMember: CustomStageMemberPosition
): CustomStageMemberPositions => ({
    ...state,
    byId: {
        ...state.byId,
        [customStageMember._id]: customStageMember,
    },
    byStageMember: {
        ...state.byStageMember,
        [customStageMember.stageMemberId]: upsert<string>(
            state.byStageMember[customStageMember.stageMemberId],
            customStageMember._id
        ),
    },
    byDevice: {
        ...state.byDevice,
        [customStageMember.deviceId]: upsert<string>(
            state.byDevice[customStageMember.deviceId],
            customStageMember._id
        ),
    },
    byDeviceAndStageMember: {
        ...state.byDeviceAndStageMember,
        [customStageMember.deviceId]: {
            ...state.byDeviceAndStageMember[customStageMember.deviceId],
            [customStageMember.stageMemberId]: customStageMember._id,
        },
    },
    allIds: upsert<string>(state.allIds, customStageMember._id),
})

function reduceCustomStageMemberPositions(
    state: CustomStageMemberPositions = {
        byId: {},
        byDevice: {},
        byStageMember: {},
        byDeviceAndStageMember: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): CustomStageMemberPositions {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byDevice: {},
                byStageMember: {},
                byDeviceAndStageMember: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { customStageMemberPositions } =
                action.payload as ServerDevicePayloads.StageJoined
            let updatedState = { ...state }
            if (customStageMemberPositions)
                customStageMemberPositions.forEach((customStageMemberPosition) => {
                    updatedState = addCustomStageMemberPosition(
                        updatedState,
                        customStageMemberPosition
                    )
                })
            return updatedState
        }
        case ServerDeviceEvents.CustomStageMemberPositionAdded: {
            const customStageMemberPosition =
                action.payload as ServerDevicePayloads.CustomStageMemberPositionAdded
            return addCustomStageMemberPosition(state, customStageMemberPosition)
        }
        case ServerDeviceEvents.CustomStageMemberPositionChanged: {
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
        case ServerDeviceEvents.CustomStageMemberPositionRemoved: {
            const id = action.payload as string
            if (state.byId[id]) {
                // TODO: Why is the line above necessary?
                const { stageMemberId, deviceId } = state.byId[id]
                return {
                    ...state,
                    byId: omit(state.byId, id),
                    byStageMember: {
                        ...state.byStageMember,
                        [stageMemberId]: without(state.byStageMember[stageMemberId], id),
                    },
                    byDevice: {
                        ...state.byDevice,
                        [deviceId]: without(state.byDevice[deviceId], id),
                    },
                    byDeviceAndStageMember: {
                        ...state.byDeviceAndStageMember,
                        [deviceId]: omit(state.byDeviceAndStageMember[deviceId], stageMemberId),
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

export default reduceCustomStageMemberPositions

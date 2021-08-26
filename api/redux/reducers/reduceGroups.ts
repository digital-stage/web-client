import omit from 'lodash/omit'
import without from 'lodash/without'
import { ServerDeviceEvents, ServerDevicePayloads, Group } from '@digitalstage/api-types'
import { upsert } from '../utils/upsert'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import Groups from '../state/Groups'

const addGroup = (state: Groups, group: Group): Groups => ({
    ...state,
    byId: {
        ...state.byId,
        [group._id]: group,
    },
    byStage: {
        ...state.byStage,
        [group.stageId]: upsert<string>(state.byStage[group.stageId], group._id),
    },
    allIds: upsert<string>(state.allIds, group._id),
})

function reduceGroups(
    prev: Groups = {
        byId: {},
        byStage: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): Groups {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byStage: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { groups } = action.payload as ServerDevicePayloads.StageJoined
            let state = { ...prev }
            if (groups)
                groups.forEach((group) => {
                    state = addGroup(state, group)
                })
            return state
        }
        case ServerDeviceEvents.GroupAdded: {
            const group = action.payload as ServerDevicePayloads.GroupAdded
            return addGroup(prev, group)
        }
        case ServerDeviceEvents.GroupChanged:
            return {
                ...prev,
                byId: {
                    ...prev.byId,
                    [action.payload._id]: {
                        ...prev.byId[action.payload._id],
                        ...action.payload,
                    },
                },
            }
        case ServerDeviceEvents.GroupRemoved: {
            const id = action.payload as ServerDevicePayloads.GroupRemoved
            const { stageId } = prev.byId[id]
            return {
                ...prev,
                byId: omit(prev.byId, action.payload),
                byStage: {
                    ...prev.byStage,
                    [stageId]: without<string>(prev.byStage[stageId], id),
                },
                allIds: without<string>(prev.allIds, action.payload),
            }
        }
        default:
            return prev
    }
}

export default reduceGroups

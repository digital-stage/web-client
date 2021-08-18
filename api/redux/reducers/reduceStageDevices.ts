import omit from 'lodash/omit'
import without from 'lodash/without'
import debug from 'debug'
import { ServerDeviceEvents, ServerDevicePayloads, StageDevice } from '@digitalstage/api-types'
import upsert from '../utils/upsert'
import InternalActionTypes from '../actions/InternalActionTypes'
import StageDevices from '../state/StageDevices'

const d = debug('reduceStageDevices')
const err = d.extend('error')

const addStageDevice = (prev: StageDevices, stageDevice: StageDevice): StageDevices => ({
    ...prev,
    byId: {
        ...prev.byId,
        [stageDevice._id]: stageDevice,
    },
    byStage: {
        ...prev.byStage,
        [stageDevice.stageId]: upsert<string>(prev.byStage[stageDevice.stageId], stageDevice._id),
    },
    byStageMember: {
        ...prev.byStageMember,
        [stageDevice.stageMemberId]: upsert<string>(
            prev.byStageMember[stageDevice.stageMemberId],
            stageDevice._id
        ),
    },
    byUser: {
        ...prev.byUser,
        [stageDevice.userId]: upsert<string>(prev.byUser[stageDevice.userId], stageDevice._id),
    },
    byGroup: {
        ...prev.byGroup,
        [stageDevice.groupId]: upsert<string>(prev.byGroup[stageDevice.groupId], stageDevice._id),
    },
    byStageAndDevice: {
        ...prev.byStageAndDevice,
        [stageDevice.stageId]: {
            ...prev.byStageAndDevice[stageDevice.stageId],
            [stageDevice.deviceId]: stageDevice._id,
        },
    },
    allIds: upsert<string>(prev.allIds, stageDevice._id),
})

function reduceStageDevices(
    prev: StageDevices = {
        byId: {},
        byStage: {},
        byGroup: {},
        byStageMember: {},
        byUser: {},
        byStageAndDevice: {},
        allIds: [],
    },
    action: {
        type: string
        payload: any
    }
): StageDevices {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return {
                byId: {},
                byStage: {},
                byStageMember: {},
                byGroup: {},
                byUser: {},
                byStageAndDevice: {},
                allIds: [],
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { stageDevices } = action.payload as ServerDevicePayloads.StageJoined
            let state = { ...prev }
            if (stageDevices)
                stageDevices.forEach((stageDevice) => {
                    state = addStageDevice(state, stageDevice)
                })
            return state
        }
        case ServerDeviceEvents.StageDeviceAdded: {
            const stageDevice = action.payload as StageDevice
            return addStageDevice(prev, stageDevice)
        }
        case ServerDeviceEvents.StageDeviceChanged: {
            const stageDevice = action.payload as Partial<StageDevice> & {
                _id: string
            }
            const previousStageDevice = prev.byId[stageDevice._id]
            if (!previousStageDevice) {
                err(`Could not find previous stage device ${stageDevice._id}`)
                return prev
            }
            return {
                ...prev,
                byId: {
                    ...prev.byId,
                    [stageDevice._id]: {
                        ...previousStageDevice,
                        ...stageDevice,
                    },
                },
            }
        }
        case ServerDeviceEvents.StageDeviceRemoved: {
            const id = action.payload as string
            const { stageId, groupId, userId, stageMemberId, deviceId } = prev.byId[id]
            return {
                ...prev,
                byId: omit(prev.byId, id),
                byStage: {
                    ...prev.byStage,
                    [stageId]: without<string>(prev.byStage[stageId], action.payload),
                },
                byStageMember: {
                    ...prev.byStageMember,
                    [stageMemberId]: without<string>(
                        prev.byStageMember[stageMemberId],
                        action.payload
                    ),
                },
                byGroup: {
                    ...prev.byGroup,
                    [groupId]: without<string>(prev.byGroup[groupId], action.payload),
                },
                byUser: {
                    ...prev.byUser,
                    [userId]: without<string>(prev.byUser[userId], action.payload),
                },
                byStageAndDevice: {
                    ...prev.byStageAndDevice,
                    [stageId]: omit(prev.byStageAndDevice[stageId], deviceId),
                },
                allIds: without<string>(prev.allIds, id),
            }
        }
        default:
            return prev
    }
}

export default reduceStageDevices

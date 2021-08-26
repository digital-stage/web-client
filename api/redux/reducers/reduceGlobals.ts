import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import Globals from '../state/Globals'
import { InternalActionTypes } from '../actions/InternalActionTypes'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'

function reduceGlobals(
    state: Globals = {
        ready: false,
        selectedMode: 'personal',
        stageId: undefined,
        groupId: undefined,
        localDeviceId: undefined,
        localUserId: undefined,
    },
    action: {
        type: string
        payload: any
    }
): Globals {
    switch (action.type) {
        case InternalActionTypes.RESET: {
            return {
                ...state,
                ready: false,
                selectedDeviceId: undefined,
                stageId: undefined,
                stageMemberId: undefined,
                groupId: undefined,
                localDeviceId: undefined,
                localStageDeviceId: undefined,
                localUserId: undefined,
            }
        }
        case InternalActionTypes.REQUEST_JOIN: {
            return {
                ...state,
                request: action.payload,
            }
        }
        case InternalActionTypes.SELECT_DEVICE: {
            if (action.payload === undefined) {
                return {
                    ...state,
                    selectedDeviceId: state.localDeviceId,
                }
            }
            return {
                ...state,
                selectedDeviceId: action.payload,
            }
        }
        case InternalActionTypes.SELECT_MODE: {
            return {
                ...state,
                selectedMode: action.payload,
            }
        }
        case ServerDeviceEvents.Ready:
            return {
                ...state,
                ready: true,
            }
        case ServerDeviceEvents.StageJoined: {
            const { stageId, groupId, stageMemberId, stageDevices } =
                action.payload as ServerDevicePayloads.StageJoined
            if (state.localDeviceId) {
                const localStageDevice = stageDevices.find(
                    (stageDevice) => stageDevice.deviceId === state.localDeviceId
                )
                if (localStageDevice) {
                    return {
                        ...state,
                        stageId,
                        groupId,
                        stageMemberId,
                        localStageDeviceId: localStageDevice._id,
                    }
                }
            }
            return {
                ...state,
                stageId,
                groupId,
            }
        }
        case ServerDeviceEvents.StageLeft:
            return {
                ...state,
                stageId: undefined,
                groupId: undefined,
                stageMemberId: undefined,
                localStageDeviceId: undefined,
            }
        case ServerDeviceEvents.UserReady:
            return {
                ...state,
                localUserId: action.payload._id,
            }
        case ServerDeviceEvents.UserRemoved:
            if (
                state.localUserId &&
                state.localUserId === (action.payload as ServerDevicePayloads.UserRemoved)
            )
                return {
                    ...state,
                    localUserId: undefined,
                }
            return state
        case ServerDeviceEvents.LocalDeviceReady: {
            // Store cookie of uuid
            const payload = action.payload as ServerDevicePayloads.LocalDeviceReady as BrowserDevice
            return {
                ...state,
                localDeviceId: payload._id,
                selectedDeviceId: state.selectedDeviceId ? state.selectedDeviceId : payload._id,
            }
        }
        case ServerDeviceEvents.StageDeviceAdded: {
            if (state.localDeviceId) {
                const { _id, deviceId } = action.payload as ServerDevicePayloads.StageDeviceAdded
                if (state.localDeviceId === deviceId)
                    return {
                        ...state,
                        localStageDeviceId: _id,
                    }
            }
            return state
        }
        default: {
            return state
        }
    }
}

export default reduceGlobals

import { ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { Globals } from '../state/Globals'
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
        showLanes: false,
        showOffline: false
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
                turn: undefined
            }
        }
        case ServerDeviceEvents.Ready: {
            const payload = action.payload as ServerDevicePayloads.Ready
            return {
                ...state,
                ...payload,
                ready: true,
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
        case InternalActionTypes.SHOW_LANES: {
            return {
                ...state,
                showLanes: action.payload,
            }
        }
        case InternalActionTypes.SHOW_OFFLINE: {
            return {
                ...state,
                showOffline: action.payload,
            }
        }
        case ServerDeviceEvents.TurnServersChanged:{
            const payload = action.payload as ServerDevicePayloads.TurnServersChanged
            return {
                ...state,
                turn: {
                    ...state.turn,
                    urls: payload
                }
            }
        }
        case ServerDeviceEvents.StageJoined: {
            const { stageId, groupId, stageDevices, stageMemberId } =
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
                stageMemberId,
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
        /*
        case ServerDeviceEvents.StageMemberAdded: {
            const payload = action.payload as ServerDevicePayloads.StageMemberAdded
            if(payload.userId === state.localUserId) {
                return {
                    ...state,
                    stageMemberId: payload._id
                }
            }
            return state
        },
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
        }*/
        default: {
            return state
        }
    }
}

export { reduceGlobals }

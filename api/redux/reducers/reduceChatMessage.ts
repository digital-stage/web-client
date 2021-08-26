import { ChatMessage, ServerDeviceEvents, ServerDevicePayloads } from '@digitalstage/api-types'
import { InternalActionTypes } from '../actions/InternalActionTypes'

function reduceChatMessage(
    state: Array<ChatMessage> = [],
    action: {
        type: string
        payload: unknown
    }
): Array<ChatMessage> {
    switch (action.type) {
        case ServerDeviceEvents.StageLeft:
        case InternalActionTypes.RESET: {
            return []
        }
        case ServerDeviceEvents.ChatMessageSend: {
            const msg = action.payload as ServerDevicePayloads.ChatMessageSend
            return [...state, msg]
        }
        default:
            return state
    }
}

export default reduceChatMessage

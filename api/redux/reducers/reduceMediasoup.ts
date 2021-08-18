import omit from 'lodash/omit'
import without from 'lodash/without'
import InternalActionTypes from '../actions/InternalActionTypes'
import Mediasoup from '../state/Mediasoup'
import { Producer } from 'mediasoup-client/lib/Producer'
import { Consumer } from 'mediasoup-client/lib/Consumer'

function reduceMediasoup(
    state: Mediasoup = {
        connected: false,
        videoConsumers: {
            byId: {},
            allIds: [],
        },
        audioConsumers: {
            byId: {},
            allIds: [],
        },
        videoProducers: {
            byId: {},
            allIds: [],
        },
        audioProducers: {
            byId: {},
            allIds: [],
        },
    },
    action: {
        type: string
        payload: unknown
    }
): Mediasoup {
    switch (action.type) {
        case InternalActionTypes.SET_MEDIASOUP_CONNECTED: {
            const payload = action.payload as boolean
            return {
                ...state,
                connected: payload,
            }
        }
        case InternalActionTypes.ADD_MEDIASOUP_VIDEO_PRODUCER: {
            const payload = action.payload as {
                id: string
                producer: Producer
            }
            return {
                ...state,
                videoProducers: {
                    byId: {
                        ...state.videoProducers.byId,
                        [payload.id]: payload.producer,
                    },
                    allIds: [...state.videoProducers.allIds, payload.id],
                },
            }
        }
        case InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_PRODUCER: {
            const id = action.payload as string
            return {
                ...state,
                videoProducers: {
                    byId: omit(state.videoProducers.byId, id),
                    allIds: without<string>(state.videoProducers.allIds, id),
                },
            }
        }
        case InternalActionTypes.ADD_MEDIASOUP_AUDIO_PRODUCER: {
            const payload = action.payload as {
                id: string
                producer: Producer
            }
            return {
                ...state,
                audioProducers: {
                    byId: {
                        ...state.audioProducers.byId,
                        [payload.id]: payload.producer,
                    },
                    allIds: [...state.audioProducers.allIds, payload.id],
                },
            }
        }
        case InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_PRODUCER: {
            const id = action.payload as string
            return {
                ...state,
                audioProducers: {
                    byId: omit(state.audioProducers.byId, id),
                    allIds: without<string>(state.audioProducers.allIds, id),
                },
            }
        }
        case InternalActionTypes.ADD_MEDIASOUP_VIDEO_CONSUMER: {
            const payload = action.payload as {
                id: string
                consumer: Consumer
            }
            return {
                ...state,
                videoConsumers: {
                    byId: {
                        ...state.videoConsumers.byId,
                        [payload.id]: payload.consumer,
                    },
                    allIds: [...state.videoConsumers.allIds, payload.id],
                },
            }
        }
        case InternalActionTypes.REMOVE_MEDIASOUP_VIDEO_CONSUMER: {
            const id = action.payload as string
            return {
                ...state,
                videoConsumers: {
                    byId: omit(state.videoConsumers.byId, id),
                    allIds: without<string>(state.videoConsumers.allIds, id),
                },
            }
        }
        case InternalActionTypes.ADD_MEDIASOUP_AUDIO_CONSUMER: {
            const payload = action.payload as {
                id: string
                consumer: Consumer
            }
            return {
                ...state,
                audioConsumers: {
                    byId: {
                        ...state.audioConsumers.byId,
                        [payload.id]: payload.consumer,
                    },
                    allIds: [...state.audioConsumers.allIds, payload.id],
                },
            }
        }
        case InternalActionTypes.REMOVE_MEDIASOUP_AUDIO_CONSUMER: {
            const id = action.payload as string
            return {
                ...state,
                audioConsumers: {
                    byId: omit(state.audioConsumers.byId, id),
                    allIds: without<string>(state.audioConsumers.allIds, id),
                },
            }
        }
        default:
            return state
    }
}

export default reduceMediasoup

import { applyMiddleware, combineReducers, createStore } from 'redux'
import reduceAuth from './reducers/reduceAuth'
import thunk from 'redux-thunk'
import reduceGlobals from './reducers/reduceGlobals'
import reduceAudioTracks from './reducers/reduceAudioTracks'
import reduceChatMessage from './reducers/reduceChatMessage'
import reduceSoundCards from './reducers/reduceSoundCards'
import reduceDevices from './reducers/reduceDevices'
import reduceCustomGroupVolumes from './reducers/reduceCustomGroupVolumes'
import reduceCustomStageMemberPositions from './reducers/reduceCustomStageMemberPositions'
import reduceCustomGroupPositions from './reducers/reduceCustomGroupPositions'
import reduceStageDevices from './reducers/reduceStageDevices'
import reduceStageMembers from './reducers/reduceStageMembers'
import reduceGroups from './reducers/reduceGroups'
import reduceStages from './reducers/reduceStages'
import reduceUsers from './reducers/reduceUsers'
import reduceCustomStageDeviceVolumes from './reducers/reduceCustomStageDeviceVolumes'
import reduceCustomAudioTrackVolumes from './reducers/reduceCustomAudioTrackVolumes'
import reduceCustomAudioTrackPositions from './reducers/reduceCustomAudioTrackPositions'
import reduceCustomStageDevicePositions from './reducers/reduceCustomStageDevicePositions'
import reduceCustomStageMemberVolumes from './reducers/reduceCustomStageMemberVolumes'
import reduceVideoTracks from './reducers/reduceVideoTracks'
import reduceRouters from './reducers/reduceRouters'
import reduceNotifications from './reducers/reduceNotifications'
import reduceMediasoup from './reducers/reduceMediasoup'
import reduceWebRTC from './reducers/reduceWebRTC'
import { composeWithDevTools } from 'redux-devtools-extension'
import cookieMiddleware from './cookieMiddleware'

const rootReducer = combineReducers({
    auth: reduceAuth,
    globals: reduceGlobals,
    chatMessages: reduceChatMessage,
    devices: reduceDevices,
    soundCards: reduceSoundCards,
    routers: reduceRouters,
    users: reduceUsers,
    stages: reduceStages,
    groups: reduceGroups,
    stageMembers: reduceStageMembers,
    stageDevices: reduceStageDevices,
    videoTracks: reduceVideoTracks,
    audioTracks: reduceAudioTracks,
    customGroupVolumes: reduceCustomGroupVolumes,
    customGroupPositions: reduceCustomGroupPositions,
    customStageMemberVolumes: reduceCustomStageMemberVolumes,
    customStageMemberPositions: reduceCustomStageMemberPositions,
    customStageDeviceVolumes: reduceCustomStageDeviceVolumes,
    customStageDevicePositions: reduceCustomStageDevicePositions,
    customAudioTrackVolumes: reduceCustomAudioTrackVolumes,
    customAudioTrackPositions: reduceCustomAudioTrackPositions,
    notifications: reduceNotifications,
    mediasoup: reduceMediasoup,
    webrtc: reduceWebRTC,
})

const store = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(thunk, cookieMiddleware))
)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store

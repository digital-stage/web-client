import { reduceAuth } from './reducers/reduceAuth'
import { reduceGlobals } from './reducers/reduceGlobals'
import { reduceAudioTracks } from './reducers/reduceAudioTracks'
import { reduceChatMessage } from './reducers/reduceChatMessage'
import { reduceSoundCards } from './reducers/reduceSoundCards'
import { reduceDevices } from './reducers/reduceDevices'
import { reduceCustomGroupVolumes } from './reducers/reduceCustomGroupVolumes'
import { reduceCustomStageMemberPositions } from './reducers/reduceCustomStageMemberPositions'
import { reduceCustomGroupPositions } from './reducers/reduceCustomGroupPositions'
import { reduceStageDevices } from './reducers/reduceStageDevices'
import { reduceStageMembers } from './reducers/reduceStageMembers'
import { reduceGroups } from './reducers/reduceGroups'
import { reduceStages } from './reducers/reduceStages'
import { reduceUsers } from './reducers/reduceUsers'
import { reduceCustomStageDeviceVolumes } from './reducers/reduceCustomStageDeviceVolumes'
import { reduceCustomAudioTrackVolumes } from './reducers/reduceCustomAudioTrackVolumes'
import { reduceCustomAudioTrackPositions } from './reducers/reduceCustomAudioTrackPositions'
import { reduceCustomStageDevicePositions } from './reducers/reduceCustomStageDevicePositions'
import { reduceCustomStageMemberVolumes } from './reducers/reduceCustomStageMemberVolumes'
import { reduceVideoTracks } from './reducers/reduceVideoTracks'
import { reduceRouters } from './reducers/reduceRouters'
import { reduceNotifications } from './reducers/reduceNotifications'
import { configureStore } from '@reduxjs/toolkit'
import { authMiddleware } from './authMiddleware'
import { notificationMiddleware } from './notificationMiddleware'

const reducer = {
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
}

const store = configureStore({
    reducer: reducer,
    devTools: true,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(authMiddleware).concat(notificationMiddleware),
})

//export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export { store }

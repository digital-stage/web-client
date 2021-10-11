/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import {reduceAuth} from './reducers/reduceAuth'
import {reduceGlobals} from './reducers/reduceGlobals'
import {reduceAudioTracks} from './reducers/reduceAudioTracks'
import {reduceChatMessage} from './reducers/reduceChatMessage'
import {reduceSoundCards} from './reducers/reduceSoundCards'
import {reduceDevices} from './reducers/reduceDevices'
import {reduceCustomGroupVolumes} from './reducers/reduceCustomGroupVolumes'
import {reduceCustomStageMemberPositions} from './reducers/reduceCustomStageMemberPositions'
import {reduceCustomGroupPositions} from './reducers/reduceCustomGroupPositions'
import {reduceStageDevices} from './reducers/reduceStageDevices'
import {reduceStageMembers} from './reducers/reduceStageMembers'
import {reduceGroups} from './reducers/reduceGroups'
import {reduceStages} from './reducers/reduceStages'
import {reduceUsers} from './reducers/reduceUsers'
import {reduceCustomStageDeviceVolumes} from './reducers/reduceCustomStageDeviceVolumes'
import {reduceCustomAudioTrackVolumes} from './reducers/reduceCustomAudioTrackVolumes'
import {reduceCustomAudioTrackPositions} from './reducers/reduceCustomAudioTrackPositions'
import {reduceCustomStageDevicePositions} from './reducers/reduceCustomStageDevicePositions'
import {reduceCustomStageMemberVolumes} from './reducers/reduceCustomStageMemberVolumes'
import {reduceVideoTracks} from './reducers/reduceVideoTracks'
import {reduceRouters} from './reducers/reduceRouters'
import {reduceNotifications} from './reducers/reduceNotifications'
import {configureStore} from '@reduxjs/toolkit'
import {authMiddleware} from './authMiddleware'
import {notificationMiddleware} from './notificationMiddleware'
import {RootState} from './RootState'
import {ReducerAction} from './actions/ReducerAction'
import {CurriedGetDefaultMiddleware} from "@reduxjs/toolkit/src/getDefaultMiddleware";
import {Middleware} from "redux";

const store = configureStore<RootState, ReducerAction, ReadonlyArray<Middleware<{}, RootState>>>({
    reducer: {
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
    },
    devTools: true,
    middleware: (getDefaultMiddleware: CurriedGetDefaultMiddleware<RootState>) =>
        getDefaultMiddleware().prepend(authMiddleware, notificationMiddleware),
})

//export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export {store}

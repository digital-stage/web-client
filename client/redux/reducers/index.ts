import {combineReducers} from "redux";
import {reduceAuth} from "./reduceAuth";
import {reduceGlobals} from "./reduceGlobals";
import {reduceChatMessage} from "./reduceChatMessage";
import {reduceDevices} from "./reduceDevices";
import {reduceSoundCards} from "./reduceSoundCards";
import {reduceRouters} from "./reduceRouters";
import {reduceUsers} from "./reduceUsers";
import {reduceStages} from "./reduceStages";
import {reduceGroups} from "./reduceGroups";
import {reduceStageMembers} from "./reduceStageMembers";
import {reduceStageDevices} from "./reduceStageDevices";
import {reduceVideoTracks} from "./reduceVideoTracks";
import {reduceAudioTracks} from "./reduceAudioTracks";
import {reduceCustomGroupVolumes} from "./reduceCustomGroupVolumes";
import {reduceCustomGroupPositions} from "./reduceCustomGroupPositions";
import {reduceCustomStageMemberVolumes} from "./reduceCustomStageMemberVolumes";
import {reduceCustomStageMemberPositions} from "./reduceCustomStageMemberPositions";
import {reduceCustomStageDeviceVolumes} from "./reduceCustomStageDeviceVolumes";
import {reduceCustomStageDevicePositions} from "./reduceCustomStageDevicePositions";
import {reduceCustomAudioTrackVolumes} from "./reduceCustomAudioTrackVolumes";
import {reduceCustomAudioTrackPositions} from "./reduceCustomAudioTrackPositions";
import {reduceNotifications} from "./reduceNotifications";

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
})
export {rootReducer}
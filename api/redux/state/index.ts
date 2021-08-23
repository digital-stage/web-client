import CustomGroupPositions from './CustomGroupPositions'
import CustomGroupVolumes from './CustomGroupVolumes'
import CustomAudioTrackPositions from './CustomAudioTrackPositions'
import CustomAudioTrackVolumes from './CustomAudioTrackVolumes'
import CustomStageMemberPositions from './CustomStageMemberPositions'
import CustomStageMemberVolumes from './CustomStageMemberVolumes'
import Devices from './Devices'
import Globals from './Globals'
import Groups from './Groups'
import AudioTracks from './AudioTracks'
import Users from './Users'
import VideoTracks from './VideoTracks'
import Routers from './Routers'
import SoundCards from './SoundCards'
import StageDevices from './StageDevices'
import StageMembers from './StageMembers'
import Stages from './Stages'
import Mediasoup from './Mediasoup'
import Notifications, {Notification} from './Notifications'
import Auth from './Auth'
import {ChatMessage} from "@digitalstage/api-types";
import CustomStageDeviceVolumes from "./CustomStageDeviceVolumes";
import CustomStageDevicePositions from "./CustomStageDevicePositions";
import WebRTC from "./WebRTC";

interface RootState {
  auth: Auth,
  globals: Globals,
  chatMessages: ChatMessage[],
  devices: Devices,
  soundCards: SoundCards,
  routers: Routers,
  users: Users,
  stages: Stages,
  groups: Groups,
  stageMembers: StageMembers,
  stageDevices: StageDevices,
  videoTracks: VideoTracks,
  audioTracks: AudioTracks,
  customGroupVolumes: CustomGroupVolumes,
  customGroupPositions: CustomGroupPositions,
  customStageMemberVolumes: CustomStageMemberVolumes,
  customStageMemberPositions: CustomStageMemberPositions,
  customStageDeviceVolumes: CustomStageDeviceVolumes,
  customStageDevicePositions: CustomStageDevicePositions,
  customAudioTrackVolumes: CustomAudioTrackVolumes,
  customAudioTrackPositions: CustomAudioTrackPositions,
  notifications: Notifications,
  mediasoup: Mediasoup,
  webrtc: WebRTC,
}

export type {
  Auth,
  Notifications,
  Notification,
  CustomGroupPositions,
  CustomGroupVolumes,
  CustomAudioTrackPositions,
  CustomAudioTrackVolumes,
  CustomStageMemberPositions,
  CustomStageMemberVolumes,
  Devices,
  Globals,
  Groups,
  AudioTracks,
  Mediasoup,
  Users,
  VideoTracks,
  Routers,
  SoundCards,
  StageMembers,
  StageDevices,
  Stages,
  WebRTC,
  RootState
}
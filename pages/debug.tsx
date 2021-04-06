import {
  ClientDeviceEvents,
  ClientDevicePayloads,
  Device,
  Group,
  Stage,
  StageMember,
  useConnection,
  User,
  useStageSelector
} from "@digitalStage/api-client-react";
import PrimaryButton from "../components/ui/button/PrimaryButton";
import DangerButton from "../components/ui/button/DangerButton";
import SecondaryButton from "../components/ui/button/SecondaryButton";
import React from "react";
import Link from "next/link";

const StageMemberView = (props: {
  id: string
}) => {
  const {id} = props;
  const stageMember = useStageSelector<StageMember>(state => state.stageMembers.byId[id]);
  const remoteUser = useStageSelector<User>(state => state.remoteUsers.byId[stageMember.userId]);
  return (
    <li>
      Stage member: {remoteUser.name}
    </li>
  )
}

const GroupView = (props: {
  id: string
  stageId: string;
}) => {
  const connection = useConnection();
  const {id, stageId} = props;
  const group = useStageSelector<Group>(state => state.groups.byId[id]);
  const stageMemberIds = useStageSelector<string[]>(state => state.stageMembers.byGroup[id] || []);
  const currentGroupId = useStageSelector<string | undefined>(state => state.globals.groupId);
  return (
    <li>
      <h5>
        {group.name} &nbsp;{(currentGroupId && currentGroupId === id)
        ? <DangerButton onClick={() => connection.emit(ClientDeviceEvents.LeaveStage)}>Leave</DangerButton>
        : <PrimaryButton onClick={() => connection.emit(ClientDeviceEvents.JoinStage, {
          stageId,
          groupId: id
        } as ClientDevicePayloads.JoinStage)}>Join</PrimaryButton>}
      </h5>

      <ul>
        {stageMemberIds.map(stageMemberId => <StageMemberView key={stageMemberId} id={stageMemberId}/>)}
      </ul>
    </li>
  );
}

const StageView = (props: {
  id: string
}) => {
  const {id} = props;
  const stage = useStageSelector<Stage>(state => state.stages.byId[id]);
  const groupIds = useStageSelector<string[]>(state => state.groups.byStage[id] || []);
  return (
    <li>
      <h4>{stage.name} ({stage.videoType}/{stage.audioType})</h4>
      <ul>
        {groupIds.map(groupId => <GroupView key={groupId} id={groupId} stageId={id}/>)}
      </ul>
    </li>
  )
}

const DeviceView = (props: { id: string }) => {
  const {id} = props;
  const connection = useConnection();
  const device = useStageSelector<Device>(state => state.devices.byId[id]);
  return (
    <li>
      {device.type}
      <ul>
        <li>
          Send video: <SecondaryButton onClick={() => connection.emit(ClientDeviceEvents.ChangeDevice, {
          _id: id,
          sendVideo: !device.sendVideo
        })}>{device.sendVideo ? "YES" : "NO"}</SecondaryButton>
        </li>
        <li>
          Send audio: <SecondaryButton onClick={() => connection.emit(ClientDeviceEvents.ChangeDevice, {
          _id: id,
          sendAudio: !device.sendAudio
        })}>{device.sendAudio ? "YES" : "NO"}</SecondaryButton>
        </li>
        <li>
          Receive video: <SecondaryButton onClick={() => connection.emit(ClientDeviceEvents.ChangeDevice, {
          _id: id,
          receiveVideo: !device.receiveVideo
        })}>{device.receiveVideo ? "YES" : "NO"}</SecondaryButton>
        </li>
        <li>
          Receive audio: <SecondaryButton onClick={() => connection.emit(ClientDeviceEvents.ChangeDevice, {
          _id: id,
          receiveAudio: !device.receiveAudio
        })}>{device.receiveAudio ? "YES" : "NO"}</SecondaryButton>
        </li>
      </ul>
    </li>
  )
}

const DEBUG = () => {
  const stageIds = useStageSelector<string[]>(state => state.stages.allIds);
  const deviceIds = useStageSelector<string[]>(state => state.devices.allIds);

  return (
    <div>
      <h1>Devices</h1>
      <ul>
        {deviceIds.map(deviceId => <DeviceView id={deviceId}/>)}
      </ul>
      <h1>Stages</h1>
      <Link href="/stages">
        <a>
          <SecondaryButton>Manage stages</SecondaryButton>
        </a>
      </Link>
      <ul>
        {stageIds.map(stageId => <StageView key={stageId} id={stageId}/>)}
      </ul>
    </div>
  )
}
export default DEBUG;
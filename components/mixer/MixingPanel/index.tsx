import {
  CustomAudioTrackVolume,
  CustomStageDeviceVolume,
  StageDevice,
  StageMember,
  useConnection,
  User,
  useStageSelector
} from "@digitalstage/api-client-react";
import {
  AudioTrack,
  ClientDeviceEvents,
  ClientDevicePayloads,
  CustomGroupVolume,
  CustomStageMemberVolume,
  Group
} from "@digitalstage/api-types";
import React, {useEffect, useState} from "react";
import styles from "./MixingPanel.module.css"
import {IoIosArrowBack, IoIosArrowForward} from "react-icons/io"
import useColors from "../../../hooks/useColors";
import HSLColor from "../../../hooks/useColors/HSLColor";
import {useCallback} from "react";
import ChannelStrip from "./ChannelStrip";
import useSelectedDevice from "../../../hooks/useSelectedDevice";
import DeviceSelector from "../../global/DeviceSelector";
import HeadlineButton from "../../../ui/button/HeadlineButton";

const AudioTrackPanel = (props: {
  id: string
  color: HSLColor,
  globalMode: boolean
}) => {
  const {id, color, globalMode} = props;
  const {device: deviceId} = useSelectedDevice()
  const audioTrack = useStageSelector<AudioTrack>(state => state.audioTracks.byId[id]);
  const customized = useStageSelector<CustomAudioTrackVolume | undefined>(state => state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] && state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][id] && state.customAudioTrackVolumes.byId[state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][id]])
  const connection = useConnection()

  const handleChange = useCallback((volume: number, muted: boolean) => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeAudioTrack, {
          _id: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.ChangeAudioTrack);
      } else {
        return connection.emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
          deviceId: deviceId,
          audioTrackId: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.SetCustomAudioTrackVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode])

  const handleReset = useCallback(() => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeAudioTrack, {
          _id: id,
          volume: 1,
          muted: false
        } as ClientDevicePayloads.ChangeAudioTrack);
      } else if (customized) {
        return connection.emit(ClientDeviceEvents.RemoveCustomAudioTrackVolume, customized._id as ClientDevicePayloads.RemoveCustomAudioTrackVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode, customized])

  return (
    <div className={styles.panel}>
      <div className={`${styles.strip} ${styles.audioTrackStrip}`}>
        <h5 className={styles.stripHeadline}>
          {audioTrack.type}
        </h5>
        <ChannelStrip
          className={styles.channelStrip}
          channel={globalMode ? audioTrack : (customized || audioTrack)}
          resettable={
            (globalMode && (audioTrack.volume !== 1 || audioTrack.muted)) ||
            !!customized
          }
          onReset={handleReset}
          onChange={handleChange}
          color={color.toProperty()}
        />
      </div>
    </div>
  )
}
const StageDevicePanel = (props: {
  id: string,
  color: HSLColor,
  globalMode: boolean
}) => {
  const {id, color, globalMode} = props;
  const {device: deviceId} = useSelectedDevice()
  const stageDevice = useStageSelector<StageDevice>(state => state.stageDevices.byId[id]);
  const customized = useStageSelector<CustomStageDeviceVolume | undefined>(state => state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] && state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][id] && state.customStageDeviceVolumes.byId[state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][id]])
  const audioTrackIds = useStageSelector<string[]>(state => state.audioTracks.byStageDevice[id] || []);
  const [expanded, setExpanded] = useState<boolean>(false);
  const connection = useConnection()

  useEffect(() => {
    if (audioTrackIds.length === 0) {
      setExpanded(false)
    }
  }, [audioTrackIds.length])

  const handleChange = useCallback((volume: number, muted: boolean) => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeStageDevice, {
          _id: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.ChangeStageDevice);
      } else {
        return connection.emit(ClientDeviceEvents.SetCustomStageDeviceVolume, {
          deviceId: deviceId,
          stageDeviceId: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.SetCustomStageDeviceVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode])

  const handleReset = useCallback(() => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeStageDevice, {
          _id: id,
          volume: 1,
          muted: false
        } as ClientDevicePayloads.ChangeStageDevice);
      } else if (customized) {
        return connection.emit(ClientDeviceEvents.RemoveCustomStageDeviceVolume, customized._id as ClientDevicePayloads.RemoveCustomStageDeviceVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode, customized])

  return (
    <div className={styles.panel}>
      <div className={`${styles.strip} ${styles.stageDeviceStrip}`}>
        {audioTrackIds.length > 0 ? (
          <div className={styles.stripExpander} onClick={() => setExpanded(prev => !prev)}>
            <h5 className={styles.stripHeadline}>
              {stageDevice.name}
            </h5>
            <div className={styles.stripExpanderButton} style={{
              backgroundColor: color.toProperty()
            }}>
              {expanded ? <IoIosArrowBack size={24}/> : <IoIosArrowForward size={24}/>}
            </div>
          </div>
        ) : (
          <h5 className={styles.stripHeadline}>
            {stageDevice.name}
          </h5>
        )}
        <ChannelStrip
          className={styles.channelStrip}
          channel={globalMode ? stageDevice : (customized || stageDevice)}
          resettable={
            (globalMode && (stageDevice.volume !== 1 || stageDevice.muted)) ||
            !!customized
          }
          onReset={handleReset}
          onChange={handleChange}
          color={color.toProperty()}
        />
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.audioTrackRow}`}>
          {audioTrackIds.map(audioTrackId => <AudioTrackPanel key={audioTrackId} id={audioTrackId}
                                                              globalMode={globalMode}
                                                              color={color}/>)}
        </div>
      )}
    </div>
  )
}
const StageMemberPanel = (props: {
  id: string
  globalMode: boolean
}) => {
  const {id, globalMode} = props;
  const {device: deviceId} = useSelectedDevice();
  const stageMember = useStageSelector<StageMember | undefined>(state => state.stageMembers.byId[id]);
  const user = useStageSelector<User | undefined>(state => stageMember && state.remoteUsers.byId[stageMember.userId])
  const stageDeviceIds = useStageSelector<string[]>(state => state.stageDevices.byStageMember[id] || []);
  const customized = useStageSelector<CustomStageMemberVolume | undefined>(state => state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] && state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][id] && state.customStageMemberVolumes.byId[state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][id]])
  const [expanded, setExpanded] = useState<boolean>(false);
  const getColor = useColors()
  const color = getColor(id)
  const connection = useConnection()

  useEffect(() => {
    if (stageDeviceIds.length === 0) {
      setExpanded(false)
    }
  }, [stageDeviceIds.length])

  const handleChange = useCallback((volume: number, muted: boolean) => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeStageMember, {
          _id: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.ChangeStageMember);
      } else {
        return connection.emit(ClientDeviceEvents.SetCustomStageMemberVolume, {
          deviceId: deviceId,
          stageMemberId: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.SetCustomStageMemberVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode])

  const handleReset = useCallback(() => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeStageMember, {
          _id: id,
          volume: 1,
          muted: false
        } as ClientDevicePayloads.ChangeStageMember);
      } else if (customized) {
        return connection.emit(ClientDeviceEvents.RemoveCustomStageMemberVolume, customized._id as ClientDevicePayloads.RemoveCustomStageMemberVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode, customized])

  return (
    <div className={styles.panel}>
      <div className={`${styles.strip} ${styles.stageMemberStrip}`}>
        {stageDeviceIds.length > 0 ? (
          <div className={styles.stripExpander} onClick={() => setExpanded(prev => !prev)}>
            <h5 className={styles.stripHeadline}>
              {user?.name || stageMember._id}
            </h5>
            <div className={styles.stripExpanderButton} style={{
              backgroundColor: color.toProperty()
            }}>
              {expanded ? <IoIosArrowBack size={24}/> : <IoIosArrowForward size={24}/>}
            </div>
          </div>
        ) : (
          <h5 className={styles.stripHeadline}>
            {user?.name || stageMember._id}
          </h5>
        )}
        <ChannelStrip
          className={styles.channelStrip}
          channel={globalMode ? stageMember : (customized || stageMember)}
          resettable={
            (globalMode && (stageMember.volume !== 1 || stageMember.muted)) ||
            !!customized
          }
          onReset={handleReset}
          onChange={handleChange}
          color={color.toProperty()}
        />
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.stageDeviceRow}`}>
          {stageDeviceIds.map(stageDeviceId => <StageDevicePanel key={stageDeviceId} id={stageDeviceId}
                                                                 globalMode={globalMode}
                                                                 color={color}/>)}
        </div>
      )}
    </div>
  )
}
const GroupPanel = (props: {
  id: string
  globalMode?: boolean
}) => {
  const {id, globalMode} = props;
  const {device: deviceId} = useSelectedDevice()
  const group = useStageSelector<Group>(state => state.groups.byId[id]);
  const customized = useStageSelector<CustomGroupVolume | undefined>(state => deviceId && state.customGroupVolumes.byDeviceAndGroup[deviceId] && state.customGroupVolumes.byDeviceAndGroup[deviceId][id] && state.customGroupVolumes.byId[state.customGroupVolumes.byDeviceAndGroup[deviceId][id]])
  const stageMemberIds = useStageSelector<string[]>(state => state.stageMembers.byGroup[id] || []);
  const [expanded, setExpanded] = useState<boolean>(false);
  const connection = useConnection()

  const handleChange = useCallback((volume: number, muted: boolean) => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeGroup, {
          _id: id,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.ChangeGroup);
      } else {
        return connection.emit(ClientDeviceEvents.SetCustomGroupVolume, {
          groupId: id,
          deviceId: deviceId,
          volume: volume,
          muted: muted
        } as ClientDevicePayloads.SetCustomGroupVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode])

  const handleReset = useCallback(() => {
    if (deviceId && connection) {
      if (globalMode) {
        return connection.emit(ClientDeviceEvents.ChangeGroup, {
          _id: id,
          volume: 1,
          muted: false
        } as ClientDevicePayloads.ChangeGroup);
      } else if (customized) {
        return connection.emit(ClientDeviceEvents.RemoveCustomGroupVolume, customized._id as ClientDevicePayloads.RemoveCustomGroupVolume);
      }
    }
    return null;
  }, [deviceId, connection, globalMode, customized])

  useEffect(() => {
    if (stageMemberIds.length === 0) {
      setExpanded(false)
    }
  }, [stageMemberIds.length])

  return (
    <div className={`${styles.panel} ${styles.groupPanel}`} style={{
      borderColor: group.color
    }}>
      <div className={`${styles.strip} ${styles.groupStrip}`}>
        {stageMemberIds.length > 0 ? (
          <div className={styles.stripExpander} onClick={() => setExpanded(prev => !prev)}>
            <h5 className={styles.stripHeadline}>
              {group.name}
            </h5>
            <div className={styles.stripExpanderButton} style={{
              backgroundColor: group.color
            }}>
              {expanded ? <IoIosArrowBack size={24}/> : <IoIosArrowForward size={24}/>}
            </div>
          </div>
        ) : (
          <h5 className={styles.stripHeadline}>
            {group.name}
          </h5>
        )}
        <ChannelStrip
          className={styles.channelStrip}
          channel={globalMode ? group : (customized || group)}
          resettable={
            (globalMode && (group.volume !== 1 || group.muted)) ||
            !!customized
          }
          onReset={handleReset}
          onChange={handleChange}
          color={group.color}
        />
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.stageMemberRow}`}>
          {stageMemberIds.map(stageMemberId => <StageMemberPanel key={stageMemberId} id={stageMemberId}
                                                                 globalMode={globalMode}/>)}
        </div>
      )}
    </div>
  )
}


const MixingPanel = () => {
  const isReady = useStageSelector<boolean>(state => state.globals.ready);
  const isInsideStage = useStageSelector<boolean>(state => !!state.globals.stageId)
  const groupIds = useStageSelector<string[]>(state => state.groups.allIds)
  const isSoundEditor = useStageSelector<boolean>(state => state.globals.localUser && state.globals.stageId && state.stages.byId[state.globals.stageId].soundEditors.some(admin => admin === state.globals.localUser._id))
  const [globalMode, setGlobalMode] = useState<boolean>(false);

  if (isReady && isInsideStage) {
    return (
      <div className={styles.wrapper}>
        {isSoundEditor && (
          <div className={styles.globalModePanel}>
            <div className={styles.globalModeSelect}>
              <HeadlineButton toggled={!globalMode} onClick={() => setGlobalMode(false)}>
                Personal mix
              </HeadlineButton>
              <HeadlineButton toggled={globalMode} onClick={() => setGlobalMode(true)}>
                Global mix
              </HeadlineButton>
            </div>
            <p
              className="micro">{globalMode ? "Diese Einstellungen gelten für alle" : "Diese Einstellungen gelten nur für Dich"}</p>
          </div>
        )}
        {!globalMode && (
          <div className={styles.deviceSelect}>
            <label className="micro">
              Betreffendes Gerät:&nbsp;&nbsp;
              <DeviceSelector/>
            </label>
          </div>
        )}
        <div className={styles.inner}>
          {groupIds.map(groupId => <div key={groupId} className={styles.groupWrapper}>
            <GroupPanel id={groupId}
                        globalMode={globalMode}/>
          </div>)}
        </div>
      </div>
    )
  }
  return null;
}
export default MixingPanel

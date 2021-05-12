import {StageDevice, StageMember, useConnection, User, useStageSelector} from "@digitalstage/api-client-react";
import {AudioTrack, ClientDeviceEvents, Group} from "@digitalstage/api-types";
import React, {useEffect, useState} from "react";
import styles from "./MixingPanel.module.css"
import {IoIosArrowBack, IoIosArrowForward, IoIosVolumeOff, IoIosVolumeHigh} from "react-icons/io"
import VolumeSlider from "../VolumeSlider";
import useColors from "../../../hooks/useColors";
import HSLColor from "../../../hooks/useColors/HSLColor";
import SecondaryButton from "../../../ui/button/SecondaryButton";
import {useCallback} from "react";
import Tabs from "../../../ui/surface/Tabs";
import Tab from "../../../ui/surface/Tab";

const AudioTrackPanel = (props: {
  id: string
  color: HSLColor
}) => {
  const {id, color} = props;
  const audioTrack = useStageSelector<AudioTrack>(state => state.audioTracks.byId[id]);

  return (
    <div className={styles.panel}>
      <div className={`${styles.strip} ${styles.audioTrackStrip}`}>
        <h5 className={styles.stripHeadline}>
          {audioTrack.type}
        </h5>
        <VolumeSlider className={styles.slider} min={0} middle={1} max={2} value={1} onChange={() => {
        }} color={color.toProperty()}/>
      </div>
    </div>
  )
}
const StageDevicePanel = (props: {
  id: string,
  color: HSLColor
}) => {
  const {id, color} = props;
  const stageDevice = useStageSelector<StageDevice>(state => state.stageDevices.byId[id]);
  const audioTrackIds = useStageSelector<string[]>(state => state.audioTracks.byStageDevice[id] || []);
  const [expanded, setExpanded] = useState<boolean>(false);

  useEffect(() => {
    if (audioTrackIds.length === 0) {
      setExpanded(false)
    }
  }, [audioTrackIds.length])

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
        <VolumeSlider className={styles.slider} min={0} middle={1} max={2} value={1} onChange={() => {
        }} color={color.toProperty()}/>
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.audioTrackRow}`}>
          {audioTrackIds.map(audioTrackId => <AudioTrackPanel key={audioTrackId} id={audioTrackId}
                                                              color={color}/>)}
        </div>
      )}
    </div>
  )
}
const StageMemberPanel = (props: {
  id: string
}) => {
  const {id} = props;
  const stageMember = useStageSelector<StageMember | undefined>(state => state.stageMembers.byId[id]);
  const user = useStageSelector<User | undefined>(state => stageMember && state.remoteUsers.byId[stageMember.userId])
  const stageDeviceIds = useStageSelector<string[]>(state => state.stageDevices.byStageMember[id] || []);
  const [expanded, setExpanded] = useState<boolean>(false);
  const getColor = useColors()
  const color = getColor(id)

  useEffect(() => {
    if (stageDeviceIds.length === 0) {
      setExpanded(false)
    }
  }, [stageDeviceIds.length])

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
        <VolumeSlider className={styles.slider} min={0} middle={1} max={2} value={1} onChange={() => {
        }} color={color.toProperty()}/>
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.stageDeviceRow}`}>
          {stageDeviceIds.map(stageDeviceId => <StageDevicePanel key={stageDeviceId} id={stageDeviceId}
                                                                 color={color}/>)}
        </div>
      )}
    </div>
  )
}
const GroupPanel = (props: {
  id: string
  global?: boolean
}) => {
  const {id} = props;
  const group = useStageSelector<Group>(state => state.groups.byId[id]);
  const stageMemberIds = useStageSelector<string[]>(state => state.stageMembers.byGroup[id] || []);
  const [expanded, setExpanded] = useState<boolean>(false);
  const connection = useConnection()

  const changeVolume = useCallback(() => {
    if (connection) {
      connection.emit(ClientDeviceEvents.ChangeGroup,)
    }
  }, [connection])

  const toggleMute = useCallback(() => {
    if (connection) {
      connection.emit(ClientDeviceEvents.ChangeGroup,)
    }
  }, [connection])

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
        <VolumeSlider className={styles.slider} min={0} middle={1} max={2} value={1} onChange={() => {
        }} color={group.color}/>
        <div className={styles.stripBottom}>
          {group && (
            <SecondaryButton round toggled={group.muted}>
              {group.muted ? <IoIosVolumeHigh/> : <IoIosVolumeOff/>}
            </SecondaryButton>
          )}
        </div>
      </div>
      {expanded && (
        <div className={`${styles.row} ${styles.stageMemberRow}`}>
          {stageMemberIds.map(stageMemberId => <StageMemberPanel key={stageMemberId} id={stageMemberId}/>)}
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
  const [global, setGlobal] = useState<boolean>(false);

  if (isReady && isInsideStage) {
    return (
      <div className={styles.wrapper}>
        {isSoundEditor && (
          <Tabs className={styles.globalSwitch}>
            <Tab title="Personal mix" onClick={() => setGlobal(false)}>
              Diese Einstellungen gelten nur für Dich
            </Tab>
            <Tab title="Global mix" onClick={() => setGlobal(true)}>
              Diese Einstellungen gelten für alle
            </Tab>
          </Tabs>
        )}
        <div className={styles.inner}>
          {groupIds.map(groupId => <div key={groupId} className={styles.groupWrapper}><GroupPanel id={groupId}
                                                                                                  global={global}/>
          </div>)}
        </div>
      </div>
    )
  }
  return null;
}
export default MixingPanel

import RoomEditor, {RoomElement} from '../RoomEditor';
import React, {useState} from 'react';
import {useIntl} from 'react-intl';
import {
  useConnection,
  RemoteUsers,
  CustomStageDevicePositions, CustomStageMemberPositions,
  Stage, StageDevice, StageMember, useStageSelector
} from "@digitalstage/api-client-react";
import useImage from "../../../hooks/useImage";
import PrimaryButton from "../../../ui/button/PrimaryButton";
import styles from './RoomManager.module.css'
import Select from '../../../ui/form/Select';
import Tabs from "../../../ui/surface/Tabs";
import Tab from "../../../ui/surface/Tab";
import {ClientDeviceEvents} from '@digitalstage/api-types';
import {ClientDevicePayloads} from '@digitalstage/api-types';
import useSelectedDevice from "../../../hooks/useSelectedDevice";

const RoomManager = (): JSX.Element => {
  const connection = useConnection()
  const {device} = useSelectedDevice();
  const users = useStageSelector<RemoteUsers>(state => state.remoteUsers);
  const stage = useStageSelector<Stage>(state => state.globals.stageId && state.stages.byId[state.globals.stageId])
  const isStageAdmin = useStageSelector<boolean>(state => stage && state.globals.localUser && stage.admins.some(admin => admin === state.globals.localUser._id))

  const stageMembers = useStageSelector<StageMember[]>(state => stage ? state.stageMembers.byStage[stage._id].map(id => state.stageMembers.byId[id]) : []);
  const customStageMemberPositions = useStageSelector<CustomStageMemberPositions>(state => state.customStageMemberPositions);
  const stageDevices = useStageSelector<StageDevice[]>(state => stage ? state.stageDevices.byStage[stage._id].map(id => state.stageDevices.byId[id]) : []);
  const customStageDevicePositions = useStageSelector<CustomStageDevicePositions>(state => state.customStageDevicePositions);

  const image = useImage('/static/icons/room-member.svg', 96, 96);
  const customImage = useImage('/static/icons/room-member-custom.svg', 96, 96);
  const [selected, setSelected] = useState<RoomElement>(undefined);
  const [globalMode, setGlobalMode] = useState<boolean>(false);
  const {formatMessage} = useIntl();
  const f = (id) => formatMessage({id});

  if (stage) {
    return (
      <div
        className={styles.wrapper}
      >
        {isStageAdmin ? (
          <React.Fragment>
            <Tabs>
              <Tab title={f('monitor')} onClick={() => setGlobalMode(false)}/>
              <Tab title={f('global')} onClick={() => setGlobalMode(true)}/>
            </Tabs>
            <p className="micro">
              {f(globalMode ? 'globalDescription' : 'monitorDescription')}
            </p>
          </React.Fragment>
        ) : null}

        <div className={styles.editorWrapper}>
          <RoomEditor
            className={styles.editor}
            elements={stageMembers.map((stageMember) => {
              if (!globalMode && customStageMemberPositions.byDeviceAndStageMember[device] &&
                customStageDevicePositions.byDeviceAndStageDevice[device][stageMember._id]) {
                const customStageMember =
                  customStageMemberPositions.byId[customStageMemberPositions.byDeviceAndStageMember[device][stageMember._id]];
                return {
                  ...stageMember,
                  image: customImage,
                  name: users[stageMember.userId]?.name || stageMember._id,
                  x: customStageMember.x,
                  y: customStageMember.y,
                  z: customStageMember.z,
                  rX: customStageMember.rX,
                  rY: customStageMember.rY,
                  rZ: customStageMember.rZ,
                  isGlobal: false,
                  opacity: 0.8,
                };
              }
              return {
                ...stageMember,
                image: image,
                name: users[stageMember.userId]?.name || stageMember._id,
                isGlobal: true,
                opacity: globalMode ? 0.8 : 0.4,
              };
            })}
            width={stage.width}
            height={stage.height}
            onChange={(element) => {
              if (globalMode && isStageAdmin) {
                connection.emit(ClientDeviceEvents.ChangeStageMember, {
                  _id: element._id,
                  x: element.x,
                  y: element.y,
                  rZ: element.rZ,
                } as ClientDevicePayloads.ChangeStageMember)
              } else {
                connection.emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
                  stageMemberId: element._id,
                  deviceId: device,
                  x: element.x,
                  y: element.y,
                  rZ: element.rZ,
                } as ClientDevicePayloads.SetCustomStageMemberPosition)
              }
            }}
            onSelected={(element) => setSelected(element)}
            onDeselected={() => setSelected(undefined)}
          />

          <PrimaryButton
            className={styles.buttonResetAll}
            onClick={() => {
              if (globalMode && isStageAdmin) {
                // Also reset stage members
                stageMembers.forEach((stageMember) => {
                  connection.emit(ClientDeviceEvents.ChangeStageMember, {
                    _id: stageMember._id,
                    x: 0,
                    y: -1,
                    rZ: 180,
                  } as ClientDevicePayloads.ChangeStageMember)
                });
              } else {
                customStageDevicePositions.allIds.forEach((id) => {
                  connection.emit(ClientDeviceEvents.RemoveCustomStageMemberPosition, id as ClientDevicePayloads.RemoveCustomStageMemberPosition)
                });
              }
            }}
          >
            {f('resetAll')}
          </PrimaryButton>
          {selected && (
            <PrimaryButton
              className={styles.buttonResetSingle}
              onClick={() => {
                if (selected) {
                  if (globalMode && isStageAdmin) {
                    connection.emit(ClientDeviceEvents.ChangeStageMember, {
                      _id: selected._id,
                      x: 0,
                      y: -1,
                      rZ: 180,
                    } as ClientDevicePayloads.ChangeStageMember)
                  } else {
                    if (customStageMemberPositions.byDeviceAndStageMember[device][selected._id]) {
                      const customStageDevicePosition =
                        customStageDevicePositions.byId[customStageDevicePositions.byDeviceAndStageDevice[device][selected._id]];
                      connection.emit(ClientDeviceEvents.RemoveCustomStageMemberPosition, customStageDevicePosition._id as ClientDevicePayloads.RemoveCustomStageMemberPosition)
                    }
                  }
                }
              }}
            >
              {f('reset')}
            </PrimaryButton>
          )}
        </div>

        {/* Mobile extra */}
        {isStageAdmin ? (
          <div className={styles.mobileSelectWrapper}>
            <Select
              className={styles.select}
              onChange={(e) => setGlobalMode(e.target.value === 'global')}
              value={globalMode ? 'global' : 'monitor'}
            >
              <option value="global">{f('global')}</option>
              <option value="monitor">{f('monitor')}</option>
            </Select>
          </div>
        ) : null}
      </div>
    );
  }

  return null;
};
export default RoomManager;

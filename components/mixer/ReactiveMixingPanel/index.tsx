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

import {
  selectIsCurrentlyStageAdmin,
  selectMode,
  selectSelectedDeviceId,
  selectSelectMode,
  selectShowOffline,
  selectStageDeviceIdsByStageMemberIdAndFilter,
  useEmit,
  useTrackedSelector
  ,
  useSelectStageMemberIdsByGroup,
  selectLocalDeviceId,
  selectGroupIdsByStageId,
  selectStageMemberById,
  selectUserNameByStageMemberId
} from '../../../client'
import React from 'react'
import {ClientDeviceEvents, ClientDevicePayloads, DefaultVolumeProperties} from '@digitalstage/api-types'
import {TextSwitch} from 'ui/TextSwitch'
import {useDispatch} from 'react-redux'
import {VolumeSlider} from './VolumeSlider'

const BiChevronDown = (): JSX.Element => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M16.293 9.293L12 13.586 7.707 9.293 6.293 10.707 12 16.414 17.707 10.707z"/>
  </svg>
)

const BiChevronUp = (): JSX.Element => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M6.293 13.293L7.707 14.707 12 10.414 16.293 14.707 17.707 13.293 12 7.586z"/>
  </svg>
)
const AudioTrackPanel = ({
                           audioTrackId,
                           deviceId,
                         }: {
  audioTrackId: string
  deviceId?: string
}): JSX.Element => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const audioTrack = state.audioTracks.byId[audioTrackId]
  const customAudioTrack = deviceId &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId] &&
  state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
    ? state.customAudioTrackVolumes.byId[
      state.customAudioTrackVolumes.byDeviceAndAudioTrack[deviceId][audioTrackId]
      ]
    : undefined
  const updateVolume = React.useCallback(
    (volume: number, muted: boolean) => {
      if (emit) {
        if (deviceId) {
          emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
            audioTrackId,
            deviceId,
            volume,
            muted,
          } as ClientDevicePayloads.SetCustomAudioTrackVolume)
        } else {
          emit(ClientDeviceEvents.ChangeAudioTrack, {
            _id: audioTrackId,
            volume,
            muted,
          } as ClientDevicePayloads.ChangeAudioTrack)
        }
      }
    },
    [emit, deviceId, audioTrackId]
  )
  const resetVolume = React.useCallback(() => {
    if (emit) {
      if (customAudioTrack) {
        emit(ClientDeviceEvents.RemoveCustomAudioTrackVolume, customAudioTrack._id)
      } else {
        emit(ClientDeviceEvents.ChangeAudioTrack, {
          _id: audioTrackId,
          ...DefaultVolumeProperties,
        })
      }
    }
  }, [audioTrackId, emit, customAudioTrack])
  return (
    <div className="audioTrack">
      <VolumeSlider
        id={audioTrackId}
        volume={customAudioTrack?.volume || audioTrack.volume}
        muted={customAudioTrack ? customAudioTrack.muted : audioTrack.muted}
        name={audioTrackId}
        modified={
          (!deviceId && (audioTrack.volume !== 1 || audioTrack.muted)) ||
          !!customAudioTrack
        }
        onChange={updateVolume}
        onReset={resetVolume}
      />
    </div>
  )
}

const StageDevicePanel = ({
                            stageDeviceId,
                            deviceId,
                          }: {
  stageDeviceId: string
  deviceId?: string
}): JSX.Element => {
  const emit = useEmit()
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const state = useTrackedSelector()
  const audioTrackIds = state.audioTracks.byStageDevice[stageDeviceId] || []
  const stageDevice = state.stageDevices.byId[stageDeviceId]
  const customStageDevice = deviceId &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
  state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
    ? state.customStageDeviceVolumes.byId[
      state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
      ]
    : undefined
  const updateVolume = React.useCallback(
    (volume: number, muted: boolean) => {
      if (emit) {
        if (deviceId) {
          emit(ClientDeviceEvents.SetCustomStageDeviceVolume, {
            stageDeviceId,
            deviceId,
            volume,
            muted,
          } as ClientDevicePayloads.SetCustomStageDeviceVolume)
        } else {
          emit(ClientDeviceEvents.ChangeStageDevice, {
            _id: stageDeviceId,
            volume,
            muted,
          } as ClientDevicePayloads.ChangeStageDevice)
        }
      }
    },
    [emit, deviceId, stageDeviceId]
  )
  const resetVolume = React.useCallback(() => {
    if (emit) {
      if (customStageDevice) {
        emit(ClientDeviceEvents.RemoveCustomStageDeviceVolume, customStageDevice._id)
      } else {
        emit(ClientDeviceEvents.ChangeStageDevice, {
          _id: stageDeviceId,
          ...DefaultVolumeProperties,
        })
      }
    }
  }, [emit, customStageDevice, stageDeviceId])
  return (
    <div className="stageDevice">
      <div
        className={`sliderRow ${
          audioTrackIds.length > 0 ? 'sliderRowExpandable' : ''
        }`}
      >
        <VolumeSlider
          id={stageDeviceId}
          volume={customStageDevice?.volume || stageDevice.volume}
          muted={customStageDevice ? customStageDevice.muted : stageDevice.muted}
          name={stageDevice?.name || stageDeviceId}
          modified={
            (!deviceId && (stageDevice.volume !== 1 || stageDevice.muted)) ||
            !!customStageDevice
          }
          onChange={updateVolume}
          onReset={resetVolume}
        />
        {audioTrackIds.length > 0 ? (
          <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <BiChevronUp/> : <BiChevronDown/>}
          </div>
        ) : null}
      </div>
      {audioTrackIds.length > 0 ? (
        <div className={`expandable ${expanded ? 'expanded' : ''}`}>
          {audioTrackIds.map((audioTrackId) => (
            <AudioTrackPanel
              key={audioTrackId}
              deviceId={deviceId}
              audioTrackId={audioTrackId}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}


const StageMemberPanel = ({
                            stageMemberId,
                            deviceId,
                          }: {
  stageMemberId: string
  deviceId?: string
}): JSX.Element => {
  const emit = useEmit()
  const [expanded, setExpanded] = React.useState<boolean>(false)
  const state = useTrackedSelector()
  const stageDeviceIds = selectStageDeviceIdsByStageMemberIdAndFilter(state, stageMemberId)
  const stageMember = selectStageMemberById(state, stageMemberId)
  const userName = selectUserNameByStageMemberId(state, stageMemberId)
  const customStageMember = deviceId &&
  state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
  state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
    ? state.customStageMemberVolumes.byId[
      state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
      ]
    : undefined
  const updateVolume = React.useCallback(
    (volume: number, muted: boolean) => {
      if (emit) {
        if (deviceId) {
          emit(ClientDeviceEvents.SetCustomStageMemberVolume, {
            stageMemberId,
            deviceId,
            volume,
            muted,
          } as ClientDevicePayloads.SetCustomStageMemberVolume)
        } else {
          emit(ClientDeviceEvents.ChangeStageMember, {
            _id: stageMemberId,
            volume,
            muted,
          } as ClientDevicePayloads.ChangeStageMember)
        }
      }
    },
    [emit, deviceId, stageMemberId]
  )
  const resetVolume = React.useCallback(() => {
    if (emit) {
      if (customStageMember) {
        emit(ClientDeviceEvents.RemoveCustomStageMemberVolume, customStageMember._id)
      } else {
        emit(ClientDeviceEvents.ChangeStageMember, {
          _id: stageMemberId,
          ...DefaultVolumeProperties,
        })
      }
    }
  }, [emit, customStageMember, stageMemberId])
  return (
    <div className="stageMember">
      <div
        className={`sliderRow ${
          stageDeviceIds.length > 0 ? 'sliderRowExpandable' : ''
        }`}
      >
        <VolumeSlider
          id={stageMemberId}
          name={userName}
          volume={customStageMember?.volume || stageMember.volume}
          muted={customStageMember ? customStageMember.muted : stageMember.muted}
          modified={
            (!deviceId && (stageMember.volume !== 1 || stageMember.muted)) ||
            !!customStageMember
          }
          onChange={updateVolume}
          onReset={resetVolume}
        />
        {stageDeviceIds.length > 0 ? (
          <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <BiChevronUp/> : <BiChevronDown/>}
          </div>
        ) : null}
      </div>
      {stageDeviceIds.length > 0 && expanded ? (
        <div className="children">
          {stageDeviceIds.map((stageDeviceId) => (
            <StageDevicePanel
              key={stageDeviceId}
              deviceId={deviceId}
              stageDeviceId={stageDeviceId}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const GroupPanel = ({groupId, deviceId}: { groupId: string; deviceId?: string }): JSX.Element => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const [expanded, setExpanded] = React.useState<boolean>(true)
  const stageMemberIds = useSelectStageMemberIdsByGroup(groupId)
  const group = state.groups.byId[groupId]
  const customGroup = deviceId &&
  state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
  state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
    ? state.customGroupVolumes.byId[
      state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
      ]
    : undefined
  const updateVolume = React.useCallback(
    (volume: number, muted: boolean) => {
      if (emit) {
        if (deviceId) {
          emit(ClientDeviceEvents.SetCustomGroupVolume, {
            groupId,
            deviceId,
            volume,
            muted,
          } as ClientDevicePayloads.SetCustomGroupVolume)
        } else {
          emit(ClientDeviceEvents.ChangeGroup, {
            _id: groupId,
            volume,
            muted,
          } as ClientDevicePayloads.ChangeGroup)
        }
      }
    },
    [emit, deviceId, groupId]
  )
  const resetVolume = React.useCallback(() => {
    if (emit) {
      if (customGroup) {
        emit(ClientDeviceEvents.RemoveCustomGroupVolume, customGroup._id)
      } else {
        emit(ClientDeviceEvents.ChangeGroup, {
          _id: groupId,
          ...DefaultVolumeProperties,
        })
      }
    }
  }, [emit, customGroup, groupId])
  return (
    <div
      className="group"
      style={{
        borderColor: group.color,
        color: group.color,
      }}
    >
      <div className="sliderRow sliderRowExpandable">
        <VolumeSlider
          id={groupId}
          volume={customGroup?.volume || group.volume}
          muted={customGroup ? customGroup.muted : group.muted}
          name={group.name}
          modified={(!deviceId && (group.volume !== 1 || group.muted)) || !!customGroup}
          onChange={updateVolume}
          onReset={resetVolume}
        />
        {stageMemberIds.length > 0 ? (
          <div className="expander" onClick={() => setExpanded((prev) => !prev)}>
            {expanded ? <BiChevronUp/> : <BiChevronDown/>}
          </div>
        ) : null}
      </div>
      {stageMemberIds.length > 0 && expanded ? (
        <div className="children">
          {stageMemberIds.map((stageMemberId) => (
            <StageMemberPanel
              key={stageMemberId}
              deviceId={deviceId}
              stageMemberId={stageMemberId}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

const ResetAllButton = ({deviceId}: { deviceId?: string }): JSX.Element => {
  const emit = useEmit()
  const state = useTrackedSelector()
  const customGroupIds = React.useMemo(() => deviceId && state.customGroupVolumes.byDevice[deviceId]
    ? state.customGroupVolumes.byDevice[deviceId]
    : [], [deviceId, state.customGroupVolumes.byDevice])
  const customStageMemberIds = React.useMemo(() => deviceId && state.customStageMemberVolumes.byDevice[deviceId]
    ? state.customStageMemberVolumes.byDevice[deviceId]
    : [], [deviceId, state.customStageMemberVolumes.byDevice])
  const customStageDeviceIds = React.useMemo(() => deviceId && state.customStageDeviceVolumes.byDevice[deviceId]
    ? state.customStageDeviceVolumes.byDevice[deviceId]
    : [], [deviceId, state.customStageDeviceVolumes.byDevice])
  const customAudioTrackIds = React.useMemo(() => deviceId && state.customAudioTrackVolumes.byDevice[deviceId]
    ? state.customAudioTrackVolumes.byDevice[deviceId]
    : [], [deviceId, state.customAudioTrackVolumes.byDevice])
  const resetAll = React.useCallback(() => {
    if (emit) {
      if (deviceId) {
        customGroupIds.map((id) => emit(ClientDeviceEvents.RemoveCustomGroupVolume, id))
        customStageMemberIds.map((id) =>
          emit(ClientDeviceEvents.RemoveCustomStageMemberVolume, id)
        )
        customStageDeviceIds.map((id) =>
          emit(ClientDeviceEvents.RemoveCustomStageDeviceVolume, id)
        )
        customAudioTrackIds.map((id) =>
          emit(ClientDeviceEvents.RemoveCustomAudioTrackVolume, id)
        )
      } else {
        state.groups.allIds.map((id) =>
          emit(ClientDeviceEvents.ChangeGroup, {
            _id: id,
            ...DefaultVolumeProperties,
          } as ClientDevicePayloads.ChangeGroup)
        )
        state.stageMembers.allIds.map((id) =>
          emit(ClientDeviceEvents.ChangeStageMember, {
            _id: id,
            ...DefaultVolumeProperties,
          } as ClientDevicePayloads.ChangeStageMember)
        )
        state.stageDevices.allIds.map((id) =>
          emit(ClientDeviceEvents.ChangeStageDevice, {
            _id: id,
            ...DefaultVolumeProperties,
          } as ClientDevicePayloads.ChangeStageDevice)
        )
        state.audioTracks.allIds.map((id) =>
          emit(ClientDeviceEvents.ChangeAudioTrack, {
            _id: id,
            ...DefaultVolumeProperties,
          } as ClientDevicePayloads.ChangeAudioTrack)
        )
      }
    }
  }, [customAudioTrackIds, customGroupIds, customStageDeviceIds, customStageMemberIds, deviceId, emit, state.audioTracks.allIds, state.groups.allIds, state.stageDevices.allIds, state.stageMembers.allIds])
  return (
    <button onClick={resetAll} className="danger">
      Alles zurücksetzen
    </button>
  )
}

const StagePanel = ({stageId}: { stageId: string }): JSX.Element => {
  const dispatch = useDispatch()
  const state = useTrackedSelector()
  const selectedDeviceId = selectSelectedDeviceId(state)
  const selectedMode = selectSelectMode(state)
  const isStageAdmin = selectIsCurrentlyStageAdmin(state)
  const groupIds = selectGroupIdsByStageId(state, stageId)
  const showOffline = selectShowOffline(state)
  const localDeviceId = selectLocalDeviceId(state)
  const emit = useEmit()
  const onOfflineToggle = React.useCallback(() => {
    if (emit && localDeviceId)
      emit(ClientDeviceEvents.ChangeDevice, {
        _id: localDeviceId,
        showOffline: !showOffline
      })
  }, [emit, localDeviceId, showOffline])
  return (
    <div className="mixingLayout">
      {isStageAdmin ? (
        <TextSwitch
          className="switch"
          value={selectedMode}
          onSelect={(v) => {
            dispatch(selectMode(v === 'global' ? 'global' : 'personal'))
          }}
        >
          <span key="personal">Persönliche Einstellungen</span>
          <span key="global">Voreinstellungen</span>
        </TextSwitch>
      ) : null}
      {groupIds.map((groupId) => (
        <GroupPanel
          key={groupId}
          deviceId={selectedMode === 'global' ? undefined : selectedDeviceId}
          groupId={groupId}
        />
      ))}
      <div className="mixingLayoutActions">
        <ResetAllButton deviceId={selectedMode === 'global' ? undefined : selectedDeviceId}/>
        <button className="" onClick={onOfflineToggle}>
          {showOffline ? 'Inaktive ausblenden' : 'Inaktive einblenden'}
        </button>
      </div>
    </div>
  )
}

const ReactiveMixingPanel = (): JSX.Element | null => {
  const state = useTrackedSelector()

  if (state.globals.ready && state.globals.stageId) {
    return <StagePanel stageId={state.globals.stageId}/>
  }
  return null
}
export {ReactiveMixingPanel}

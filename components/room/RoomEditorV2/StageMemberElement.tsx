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

import {RoomSelection} from "./RoomSelection"
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import {shallowEqual} from "react-redux";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {RoomElement} from "./RoomElement";
import React from "react";

const StageMemberElement = ({stageMemberId, selection, onSelected}: {
  stageMemberId: string,
  selection: RoomSelection[]
  onSelected: (selection: RoomSelection) => void
}) => {
  const emit = useEmit()
  const position = useStageSelector<{ x: number, y: number, rZ: number }>(state => ({
    x: state.stageMembers.byId[stageMemberId].x,
    y: state.stageMembers.byId[stageMemberId].y,
    rZ: state.stageMembers.byId[stageMemberId].rZ
  }), shallowEqual)
  const customPosition = useStageSelector<{ _id: string, x: number, y: number, rZ: number } | undefined>(
    (state) => {
      if (
        state.globals.selectedMode === "personal" &&
        state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId] &&
        state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]) {
        const {
          _id,
          x,
          y,
          rZ,
        } = state.customStageMemberPositions.byId[state.customStageMemberPositions.byDeviceAndStageMember[state.globals.selectedDeviceId][stageMemberId]]
        return {
          _id, x, y, rZ
        }
      }
      return undefined
    }, shallowEqual)
  const groupPosition = useStageSelector<{ x: number, y: number, rZ: number }>(
    state => {
      const selectedDevice = state.globals.selectedDeviceId
      const groupId = state.stageMembers.byId[stageMemberId].groupId
      const customGroupId = state.globals.selectedMode === "personal" &&
        state.customGroupPositions.byDeviceAndGroup[selectedDevice] &&
        state.customGroupPositions.byDeviceAndGroup[selectedDevice][groupId]
      return customGroupId ? ({
        x: state.customGroupPositions.byId[customGroupId].x,
        y: state.customGroupPositions.byId[customGroupId].y,
        rZ: state.customGroupPositions.byId[customGroupId].rZ
      }) : ({
        x: state.groups.byId[groupId].x,
        y: state.groups.byId[groupId].y,
        rZ: state.groups.byId[groupId].rZ,
      })
    }, shallowEqual
  )
  const username = useStageSelector<string | undefined>((state) =>
    state.users.byId[state.stageMembers.byId[stageMemberId].userId]?.name
  )
  const groupColor = useStageSelector(state => state.groups.byId[state.stageMembers.byId[stageMemberId].groupId].color)


  const [currentPosition, setCurrentPosition] = React.useState<{ x: number; y: number; rZ: number }>({
    x: groupPosition.x + (customPosition?.x || position.x),
    y: groupPosition.y + (customPosition?.y || position.y),
    rZ: groupPosition.rZ + (customPosition?.rZ || position?.rZ)
  })
  const selectedDeviceId = useStageSelector<string | undefined>(state => state.globals.selectedMode === "personal" && state.globals.selectedDeviceId)
  const handleFinalChange = React.useCallback((event: { x?: number; y?: number; rZ?: number }) => {
    let normalized = {
      x: event.x ? event.x - groupPosition.x : undefined,
      y: event.y ? event.y - groupPosition.y : undefined,
      rZ: event.rZ ? event.rZ - groupPosition.rZ : undefined,
    }
    if (selectedDeviceId) {
      emit(ClientDeviceEvents.SetCustomStageMemberPosition, {
        stageMemberId,
        deviceId: selectedDeviceId,
        ...normalized,
      } as ClientDevicePayloads.SetCustomStageMemberPosition)
    } else {
      emit(ClientDeviceEvents.ChangeStageMember, {
        _id: stageMemberId,
        ...normalized,
      } as ClientDevicePayloads.ChangeStageMember)
    }
  }, [emit, groupPosition.x, groupPosition.y, groupPosition.rZ, stageMemberId, selectedDeviceId])
  const handleSelect = React.useCallback(() => {
    onSelected({
      type: 'member',
      id: customPosition
        ? customPosition._id
        : stageMemberId,
    })
  }, [customPosition, stageMemberId, onSelected])

  React.useEffect(() => {
    setCurrentPosition({
      x: groupPosition.x + (customPosition?.x || position.x),
      y: groupPosition.y + (customPosition?.y || position.y),
      rZ: groupPosition.rZ + (customPosition?.rZ || position?.rZ)
    })
  }, [groupPosition, customPosition, position])

  const stageDeviceIds = useStageSelector<string[]>(state => state.stageDevices.byStageMember[stageMemberId]?.filter(id => !!state.audioTracks.byStageDevice[id]) || [])

  return (
    <RoomElement
      name={username || stageMemberId}
      size={64}
      src="/room/member.svg"
      x={currentPosition.x}
      y={currentPosition.y}
      rZ={currentPosition.rZ}
      onChange={(e) =>
        setCurrentPosition((prev) => ({
          x: e.x || prev.x,
          y: e.y || prev.y,
          rZ: e.rZ || prev.rZ,
        }))
      }
      onFinalChange={handleFinalChange}
      onSelected={handleSelect}
      selected={selection.some((value) => {
        if (value.type === 'member') {
          if (customPosition)
            return value.id === customPosition._id
          return value.id === stageMemberId
        }
      })}
      color={groupColor}
    />
  )
}

export {StageMemberElement}
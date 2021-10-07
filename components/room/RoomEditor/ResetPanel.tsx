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

import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import React from 'react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import {RoomSelection} from './RoomSelection'

const SelectionToGlobal = {
    group: ClientDeviceEvents.ChangeGroup,
    member: ClientDeviceEvents.ChangeStageMember,
    device: ClientDeviceEvents.ChangeStageDevice,
    track: ClientDeviceEvents.ChangeAudioTrack,
}
const SelectionToCustom = {
    group: ClientDeviceEvents.RemoveCustomGroupPosition,
    member: ClientDeviceEvents.RemoveCustomStageMemberPosition,
    device: ClientDeviceEvents.RemoveCustomStageDevicePosition,
    track: ClientDeviceEvents.RemoveCustomAudioTrackPosition,
}

const DEFAULT_POSITION = {
    x: 0,
    y: 0,
    rZ: 0,
}

const ResetPanel = ({ deviceId, selection }: { deviceId?: string; selection: RoomSelection[] }) => {
    const emit = useEmit()
    const groupIds = useStageSelector((state) => state.groups.allIds)
    const stageMemberIds = useStageSelector((state) => state.stageMembers.allIds)
    const stageDeviceIds = useStageSelector((state) => state.stageDevices.allIds)
    const audioTracksIds = useStageSelector((state) => state.audioTracks.allIds)
    const customGroupIds = useStageSelector((state) =>
        deviceId && state.customGroupPositions.byDevice[deviceId]
            ? state.customGroupPositions.byDevice[deviceId]
            : []
    )
    const customStageMemberIds = useStageSelector((state) =>
        deviceId && state.customStageMemberPositions.byDevice[deviceId]
            ? state.customStageMemberPositions.byDevice[deviceId]
            : []
    )
    const customStageDeviceIds = useStageSelector((state) =>
        deviceId && state.customStageDevicePositions.byDevice[deviceId]
            ? state.customStageDevicePositions.byDevice[deviceId]
            : []
    )
    const customAudioTrackIds = useStageSelector((state) =>
        deviceId && state.customAudioTrackPositions.byDevice[deviceId]
            ? state.customAudioTrackPositions.byDevice[deviceId]
            : []
    )
    const resetAll = React.useCallback(() => {
        if(emit) {
            if (deviceId) {
                customGroupIds.map((id) => emit(ClientDeviceEvents.RemoveCustomGroupPosition, id))
                customStageMemberIds.map((id) =>
                  emit(ClientDeviceEvents.RemoveCustomStageMemberPosition, id)
                )
                customStageDeviceIds.map((id) =>
                  emit(ClientDeviceEvents.RemoveCustomStageDevicePosition, id)
                )
                customAudioTrackIds.map((id) =>
                  emit(ClientDeviceEvents.RemoveCustomAudioTrackPosition, id)
                )
            } else {
                groupIds.map((id) =>
                  emit(ClientDeviceEvents.ChangeGroup, {
                      _id: id,
                      ...DEFAULT_POSITION,
                  } as ClientDevicePayloads.ChangeGroup)
                )
                stageMemberIds.map((id) =>
                  emit(ClientDeviceEvents.ChangeStageMember, {
                      _id: id,
                      ...DEFAULT_POSITION,
                  })
                )
                stageDeviceIds.map((id) =>
                  emit(ClientDeviceEvents.ChangeStageDevice, {
                      _id: id,
                      ...DEFAULT_POSITION,
                  })
                )
                audioTracksIds.map((id) =>
                  emit(ClientDeviceEvents.ChangeAudioTrack, {
                      _id: id,
                      ...DEFAULT_POSITION,
                  })
                )
            }
        }
    }, [
        audioTracksIds,
        customAudioTrackIds,
        customGroupIds,
        customStageDeviceIds,
        customStageMemberIds,
        deviceId,
        emit,
        groupIds,
        stageDeviceIds,
        stageMemberIds,
    ])
    const resetSelection = React.useCallback(() => {
        if(emit) {
            if (deviceId) {
                selection.map((selection) => {
                    emit(SelectionToCustom[selection.type], selection.id)
                })
            } else {
                selection.map((selection) =>
                  emit(SelectionToGlobal[selection.type], {
                      _id: selection.id,
                      ...DEFAULT_POSITION,
                  })
                )
            }
        }
    }, [deviceId, emit, selection])

    return (
        <div className="roomResetPanel">
            {selection.length > 0 ? (
                <button className="small" onClick={resetSelection}>
                    Auswahl löschen
                </button>
            ) : null}
            <button className="small" onClick={resetAll}>
                Alle löschen
            </button>
        </div>
    )
}
export { ResetPanel }

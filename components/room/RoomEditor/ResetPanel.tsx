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

import {useEmit, useTrackedSelector} from '../../../client'
import React from 'react'
import {ClientDeviceEvents, ClientDevicePayloads} from '@digitalstage/api-types'
import {BiReset} from 'react-icons/bi'
import {RoomSelection} from '../../../ui/RoomEditor/RoomSelection'

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

const ResetPanel = ({deviceId, selections}: { deviceId?: string; selections: RoomSelection[] }): JSX.Element => {
    const emit = useEmit()
    const state = useTrackedSelector()
    const customGroupIds = React.useMemo(() =>
        deviceId && state.customGroupPositions.byDevice[deviceId]
            ? state.customGroupPositions.byDevice[deviceId]
            : [], [deviceId, state.customGroupPositions.byDevice])

    const customStageMemberIds = React.useMemo(() =>
            deviceId && state.customStageMemberPositions.byDevice[deviceId]
                ? state.customStageMemberPositions.byDevice[deviceId]
                : []
        , [deviceId, state.customStageMemberPositions.byDevice])
    const customStageDeviceIds = React.useMemo(() =>
            deviceId && state.customStageDevicePositions.byDevice[deviceId]
                ? state.customStageDevicePositions.byDevice[deviceId]
                : []
        , [deviceId, state.customStageDevicePositions.byDevice])
    const customAudioTrackIds = React.useMemo(() =>
            deviceId && state.customAudioTrackPositions.byDevice[deviceId]
                ? state.customAudioTrackPositions.byDevice[deviceId]
                : []
        , [deviceId, state.customAudioTrackPositions.byDevice])
    const resetAll = React.useCallback(() => {
        if (emit) {
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
                state.groups.allIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeGroup, {
                        _id: id,
                        ...DEFAULT_POSITION,
                    } as ClientDevicePayloads.ChangeGroup)
                )
                state.stageMembers.allIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeStageMember, {
                        _id: id,
                        ...DEFAULT_POSITION,
                    })
                )
                state.stageDevices.allIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeStageDevice, {
                        _id: id,
                        ...DEFAULT_POSITION,
                    })
                )
                state.audioTracks.allIds.map((id) =>
                    emit(ClientDeviceEvents.ChangeAudioTrack, {
                        _id: id,
                        ...DEFAULT_POSITION,
                    })
                )
            }
        }
    }, [customAudioTrackIds, customGroupIds, customStageDeviceIds, customStageMemberIds, deviceId, emit, state.audioTracks.allIds, state.groups.allIds, state.stageDevices.allIds, state.stageMembers.allIds])
    const resetSelection = React.useCallback(() => {
        if (emit) {
            console.log("resetSelection c", selections)
            if (deviceId) {
                selections.map((selection) => {
                    emit(SelectionToCustom[selection.type], selection.customId)
                })
            } else {
                console.log("resetSelection s", selections)
                selections.map((selection) =>
                    emit(SelectionToGlobal[selection.type], {
                        _id: selection.id,
                        ...DEFAULT_POSITION,
                    })
                )
            }
        }
    }, [deviceId, emit, selections])

    return (
        <div className="resetPanel">
            {selections.length > 0 ? (
                <button className="small" onClick={resetSelection}>
                    <BiReset/>&nbsp;&nbsp;Auswahl
                </button>
            ) : null}
            <button className="small" onClick={resetAll}>
                <BiReset/>&nbsp;&nbsp;Alle
            </button>
        </div>
    )
}
export {ResetPanel}

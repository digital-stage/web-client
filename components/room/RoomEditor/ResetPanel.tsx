import { useEmit, useStageSelector } from '@digitalstage/api-client-react'
import React, { useCallback } from 'react'
import { ClientDeviceEvents, ClientDevicePayloads } from '@digitalstage/api-types'
import styles from './RoomEditor.module.scss'
import RoomSelection from './RoomSelection'

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
    const resetAll = useCallback(() => {
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
    const resetSelection = useCallback(() => {
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
    }, [deviceId, emit, selection])

    return (
        <div className={styles.resetPanel}>
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
export default ResetPanel

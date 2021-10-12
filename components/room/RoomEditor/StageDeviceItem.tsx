import {
    selectCustomStageDevicePositionByStageDeviceId,
    selectDeviceNameByStageDeviceId,
    selectStageDevicePositionByStageDeviceId,
    useEmit,
    useTrackedSelector
} from "@digitalstage/api-client-react";
import React from "react";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {CenterIcon} from "./icons/CenterIcon";
import {StageDeviceIcon} from "./icons/StageDeviceIcon";
import {AudioTrackItem} from "./AudioTrackItem";

const StageDeviceItem = ({
                             stageDeviceId,
                             userName,
                             selections,
                             onSelect,
                             onDeselect,
                             groupColor,
                             stageMemberPosition
                         }: {
    userName: string
    stageDeviceId: string,
    selections: RoomSelection[]
    onSelect?: (selection: RoomSelection) => void
    onDeselect?: (selection: RoomSelection) => void
    groupColor: string,
    stageMemberPosition: RoomPositionWithAngle
}) => {
    const state = useTrackedSelector()
    const isMine = state.stageDevices.byId[stageDeviceId].userId === state.globals.localUserId
    const isCurrent = state.stageDevices.byId[stageDeviceId].deviceId === state.globals.selectedDeviceId
    const isLocal = stageDeviceId === state.globals.localStageDeviceId

    const position = selectStageDevicePositionByStageDeviceId(state, stageDeviceId)
    const customPosition = selectCustomStageDevicePositionByStageDeviceId(state, stageDeviceId)
    const [currentPosition, setCurrentPosition] = React.useState<RoomPositionWithAngle>({
        x: customPosition?.x || position.x,
        y: customPosition?.y || position.y,
        rZ: customPosition?.rZ || position.rZ
    })
    React.useEffect(() => {
        setCurrentPosition({
            x: customPosition?.x || position.x,
            y: customPosition?.y || position.y,
            rZ: customPosition?.rZ || position.rZ
        })
    }, [customPosition?.rZ, customPosition?.x, customPosition?.y, position.rZ, position.x, position.y])

    const audioTrackIds = state.audioTracks.byStageDevice[stageDeviceId] || []

    // Stage management only for this item
    const selected = React.useMemo(() => selections.some(selection => selection.id === stageDeviceId), [selections, stageDeviceId])
    const deviceName = selectDeviceNameByStageDeviceId(state, stageDeviceId)
    const onClicked = React.useCallback(() => {
        if (selected) {
            if (onDeselect) {
                onDeselect({
                    type: 'device',
                    id: stageDeviceId,
                    customId: customPosition && customPosition._id
                })
            }
        } else if (onSelect) {
                onSelect({
                    type: 'device',
                    id: stageDeviceId,
                    customId: customPosition && customPosition._id
                })
            }
    }, [customPosition, onDeselect, onSelect, selected, stageDeviceId])

    const emit = useEmit()
    const deviceId = state.globals.selectedMode === "personal" ? state.globals.selectedDeviceId : undefined
    const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
        if (emit) {
            if (customPosition || deviceId) {
                emit(ClientDeviceEvents.SetCustomStageDevicePosition, {
                    stageDeviceId,
                    deviceId,
                    ...position
                } as ClientDevicePayloads.SetCustomStageDevicePosition)
            } else {
                emit(ClientDeviceEvents.ChangeStageDevice, {
                    _id: stageDeviceId,
                    ...position
                } as ClientDevicePayloads.ChangeStageDevice)
            }
        }
    }, [customPosition, deviceId, emit, stageDeviceId])

    const caption = React.useMemo(() => {
        if (isLocal) {
            return `Dieses Gerät`
        }
        if (isCurrent) {
            return `Ausgewählt: ${deviceName}`
        }
        if (isMine) {
            return `Mein Gerät: ${deviceName}`
        }
        return `${userName}: ${deviceName}`
    }, [deviceName, isCurrent, isLocal, isMine, userName])

    const onChange = React.useCallback((position: RoomPositionWithAngle) => {
        setCurrentPosition(position)
    }, [])

    return (
        <>
            <RoomItem
                caption={caption}
                x={currentPosition.x}
                y={currentPosition.y}
                rZ={currentPosition.rZ}
                offsetX={stageMemberPosition.x}
                offsetY={stageMemberPosition.y}
                offsetRz={stageMemberPosition.rZ}
                size={isCurrent ? 0.8 : 0.5}
                color={isLocal ? 'var(---text)' : groupColor}
                selected={selected}
                onClicked={onClicked}
                onChange={onChange}
                onFinalChange={onFinalChange}
            >
                {isCurrent ? <CenterIcon/> : <StageDeviceIcon/>}
            </RoomItem>
            {audioTrackIds.map((audioTrackId, index) => <AudioTrackItem
                key={audioTrackId}
                audioTrackId={audioTrackId}
                caption={`${caption} (${index})`}
                selections={selections}
                onSelect={onSelect}
                onDeselect={onDeselect}
                groupColor={groupColor}
                stageDevicePosition={{
                    x: currentPosition.x + stageMemberPosition.x,
                    y: currentPosition.y + stageMemberPosition.y,
                    rZ: currentPosition.rZ + stageMemberPosition.rZ,
                }}
            />)}
        </>
    )
}
export {StageDeviceItem}
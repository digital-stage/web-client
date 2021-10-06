import {RoomSelection} from "./RoomEditor/RoomSelection";
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import {
    useCustomStageDevicePosition,
    useStageDevicePosition,
} from "./utils";
import React from "react";
import {RoomItem, RoomPositionWithAngle} from "./RoomEditor";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {CenterIcon} from "./icons/CenterIcon";
import {StageDeviceIcon} from "./icons/StageDeviceIcon";
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";

const StageDeviceItem = ({stageDeviceId, userName, local, selections, onSelect, onDeselect, groupColor, stageMemberPosition}: {
    userName: string
    stageDeviceId: string,
    local: boolean,
    selections: RoomSelection[]
    onSelect?: (selection: RoomSelection) => void
    onDeselect?: (selection: RoomSelection) => void
    groupColor: string,
    stageMemberPosition: RoomPositionWithAngle
}) => {
    const position = useStageDevicePosition(stageDeviceId)
    const customPosition = useCustomStageDevicePosition(stageDeviceId)
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

    const audioTrackIds = useStageSelector<string[]>((state) => state.audioTracks.byStageDevice[stageDeviceId])

    // Stage management only for this item
    const selected = React.useMemo(() => selections.some(selection => selection.id === stageDeviceId), [selections, stageDeviceId])
    const deviceName = useStageSelector<string>(state => {
        const device = state.stageDevices.byId[stageDeviceId]
        if(device.userId === state.globals.localUserId && device.type === "browser") {
            // Use device instead of stage device for naming
            const browserDevice = state.devices.byId[device.deviceId] as BrowserDevice
            return browserDevice.browser
        }
        return device.name
    })
    const onClicked = React.useCallback((e: MouseEvent) => {
        if (selected) {
            if (onDeselect) {
                onDeselect({
                    type: 'device',
                    id: stageDeviceId,
                    customId: customPosition && customPosition._id
                })
            }
        } else {
            if (onSelect) {
                onSelect({
                    type: 'device',
                    id: stageDeviceId,
                    customId: customPosition && customPosition._id
                })
            }
        }
    }, [customPosition, onDeselect, onSelect, selected, stageDeviceId])

    const emit = useEmit()
    const deviceId = useStageSelector(state => state.globals.selectedDeviceId)
    const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
        if (customPosition && deviceId) {
            emit(ClientDeviceEvents.SetCustomStageDevicePosition, {
                stageDeviceId: stageDeviceId,
                deviceId: deviceId,
                ...position
            } as ClientDevicePayloads.SetCustomStageDevicePosition)
        } else {
            emit(ClientDeviceEvents.ChangeStageDevice, {
                _id: stageDeviceId,
                ...position
            } as ClientDevicePayloads.ChangeStageDevice)
        }
    }, [customPosition, deviceId, emit, stageDeviceId])

    return (
        <RoomItem
            caption={`${userName}: ${deviceName}`}
            x={currentPosition.x}
            y={currentPosition.y}
            rZ={currentPosition.rZ}
            offsetX={stageMemberPosition.x}
            offsetY={stageMemberPosition.y}
            offsetRz={stageMemberPosition.rZ}
            size={local ? 0.8 : 0.5}
            color={groupColor}
            selected={selected}
            onClicked={onClicked}
            onChange={position => setCurrentPosition(position)}
            onFinalChange={onFinalChange}
        >
            {local ? <CenterIcon/> : <StageDeviceIcon/>}
        </RoomItem>
    )
}
export {StageDeviceItem}
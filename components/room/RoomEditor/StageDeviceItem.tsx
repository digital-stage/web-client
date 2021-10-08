import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import {
    useCustomStageDevicePosition,
    useStageDevicePosition,
} from "./utils";
import React from "react";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {CenterIcon} from "./icons/CenterIcon";
import {StageDeviceIcon} from "./icons/StageDeviceIcon";
import {BrowserDevice} from "@digitalstage/api-types/dist/model/browser";
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
    const isMine = useStageSelector<boolean>(state => state.stageDevices.byId[stageDeviceId].userId === state.globals.localUserId)
    const isCurrent = useStageSelector<boolean>(state => state.stageDevices.byId[stageDeviceId].deviceId === state.globals.selectedDeviceId)
    const isLocal = useStageSelector<boolean>(state => stageDeviceId === state.globals.localStageDeviceId)

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

    const audioTrackIds = useStageSelector<string[]>((state) => state.audioTracks.byStageDevice[stageDeviceId] || [])

    // Stage management only for this item
    const selected = React.useMemo(() => selections.some(selection => selection.id === stageDeviceId), [selections, stageDeviceId])
    const deviceName = useStageSelector<string>(state => {
        const device = state.stageDevices.byId[stageDeviceId]
        if (device.userId === state.globals.localUserId && device.type === "browser") {
            // Use device instead of stage device for naming
            const browserDevice = state.devices.byId[device.deviceId] as BrowserDevice
            if (browserDevice.browser)
                return browserDevice.name || `${browserDevice.browser} (${browserDevice.os})`
        }
        return device.name
    })
    const onClicked = React.useCallback(() => {
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
    const deviceId = useStageSelector<string | undefined>(state => state.globals.selectedMode === "personal" ? state.globals.selectedDeviceId : undefined)
    const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
        if (emit) {
            if (customPosition || deviceId) {
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
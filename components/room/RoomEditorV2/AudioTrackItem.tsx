import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";
import {useEmit, useStageSelector} from "@digitalstage/api-client-react";
import {
    useAudioTrackPosition, useCustomAudioTrackPosition,
} from "./utils";
import React from "react";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {AudioTrackIcon} from "./icons/AudioTrackIcon";
import {IoVolumeHigh, IoVolumeMute} from "react-icons/io5";

const AudioTrackItem = ({
                            audioTrackId,
                            caption,
                            selections,
                            onSelect,
                            onDeselect,
                            groupColor,
                            stageDevicePosition
                        }: {
    caption: string
    audioTrackId: string,
    selections: RoomSelection[]
    onSelect?: (selection: RoomSelection) => void
    onDeselect?: (selection: RoomSelection) => void
    groupColor: string,
    stageDevicePosition: RoomPositionWithAngle
}) => {
    const position = useAudioTrackPosition(audioTrackId)
    const customPosition = useCustomAudioTrackPosition(audioTrackId)
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

    // Stage management only for this item
    const selected = React.useMemo(() => selections.some(selection => selection.id === audioTrackId), [selections, audioTrackId])
    const muted = useStageSelector<boolean>(state => state.audioTracks.byId[audioTrackId].muted)
    const onClicked = React.useCallback((e: MouseEvent) => {
        if (selected) {
            if (onDeselect) {
                onDeselect({
                    type: 'track',
                    id: audioTrackId,
                    customId: customPosition && customPosition._id
                })
            }
        } else {
            if (onSelect) {
                onSelect({
                    type: 'track',
                    id: audioTrackId,
                    customId: customPosition && customPosition._id
                })
            }
        }
    }, [customPosition, onDeselect, onSelect, selected, audioTrackId])

    const emit = useEmit()
    const deviceId = useStageSelector(state => state.globals.selectedDeviceId)
    const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
        if (customPosition && deviceId) {
            emit(ClientDeviceEvents.SetCustomAudioTrackPosition, {
                audioTrackId: audioTrackId,
                deviceId: deviceId,
                ...position
            } as ClientDevicePayloads.SetCustomAudioTrackPosition)
        } else {
            emit(ClientDeviceEvents.ChangeAudioTrack, {
                _id: audioTrackId,
                ...position
            } as ClientDevicePayloads.ChangeAudioTrack)
        }
    }, [customPosition, deviceId, emit, audioTrackId])

    const onMuteClicked = React.useCallback((e) => {
        e.preventDefault()
        e.stopPropagation()
        if (customPosition && deviceId) {
            emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
                audioTrackId: audioTrackId,
                deviceId: deviceId,
                muted: !muted
            } as ClientDevicePayloads.SetCustomAudioTrackVolume)
        } else {
            emit(ClientDeviceEvents.ChangeAudioTrack, {
                _id: audioTrackId,
                muted: !muted
            } as ClientDevicePayloads.ChangeAudioTrack)
        }
    }, [audioTrackId, customPosition, deviceId, emit, muted])

    return (
        <RoomItem
            caption={caption}
            x={currentPosition.x}
            y={currentPosition.y}
            rZ={currentPosition.rZ}
            offsetX={stageDevicePosition.x}
            offsetY={stageDevicePosition.y}
            offsetRz={stageDevicePosition.rZ}
            size={0.5}
            color={groupColor}
            selected={selected}
            onClicked={onClicked}
            onChange={position => setCurrentPosition(position)}
            onFinalChange={onFinalChange}
        >
            <AudioTrackIcon/>
            <span onClick={onMuteClicked} className={`muteField`}>{muted ? <IoVolumeMute /> : <IoVolumeHigh/>}</span>
            <style jsx>{`
                .muteField {
                    position: absolute;
                    top: -20%;
                    right: -10%;
                    color: ${muted ? 'var(---danger)' : 'var(---success)'};
                }
            `}</style>
        </RoomItem>
    )
}
export {AudioTrackItem}
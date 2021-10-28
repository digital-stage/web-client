import {
  selectAudioTrackPositionByAudioTrackId,
  selectCustomAudioTrackPositionByAudioTrackId,
  useEmit,
  useTrackedSelector
} from "../../../client";
import React from "react";
import {ClientDeviceEvents, ClientDevicePayloads} from "@digitalstage/api-types";
import {IoVolumeHigh, IoVolumeMute} from "react-icons/io5";
import {RoomItem, RoomPositionWithAngle} from "../../../ui/RoomEditor";
import {AudioTrackIcon} from "./icons/AudioTrackIcon";
import {RoomSelection} from "../../../ui/RoomEditor/RoomSelection";

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
}): JSX.Element => {
  const state = useTrackedSelector()
  const position = selectAudioTrackPositionByAudioTrackId(state, audioTrackId)
  const customPosition = selectCustomAudioTrackPositionByAudioTrackId(state, audioTrackId)
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
  const {muted} = state.audioTracks.byId[audioTrackId]
  const onClicked = React.useCallback(() => {
    if (selected) {
      if (onDeselect) {
        onDeselect({
          type: 'track',
          id: audioTrackId,
          customId: customPosition && customPosition._id
        })
      }
    } else if (onSelect) {
      onSelect({
        type: 'track',
        id: audioTrackId,
        customId: customPosition && customPosition._id
      })
    }
  }, [customPosition, onDeselect, onSelect, selected, audioTrackId])

  const emit = useEmit()
  const deviceId = state.globals.selectedMode === "personal" ? state.globals.selectedDeviceId : undefined
  const onFinalChange = React.useCallback((position: RoomPositionWithAngle) => {
    if (emit) {
      if (customPosition || deviceId) {
        emit(ClientDeviceEvents.SetCustomAudioTrackPosition, {
          audioTrackId,
          deviceId,
          ...position
        } as ClientDevicePayloads.SetCustomAudioTrackPosition)
      } else {
        emit(ClientDeviceEvents.ChangeAudioTrack, {
          _id: audioTrackId,
          ...position
        } as ClientDevicePayloads.ChangeAudioTrack)
      }
    }
  }, [customPosition, deviceId, emit, audioTrackId])

  const onMuteClicked = React.useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (emit) {
      if (customPosition && deviceId) {
        emit(ClientDeviceEvents.SetCustomAudioTrackVolume, {
          audioTrackId,
          deviceId,
          muted: !muted
        } as ClientDevicePayloads.SetCustomAudioTrackVolume)
      } else {
        emit(ClientDeviceEvents.ChangeAudioTrack, {
          _id: audioTrackId,
          muted: !muted
        } as ClientDevicePayloads.ChangeAudioTrack)
      }
    }
  }, [audioTrackId, customPosition, deviceId, emit, muted])

  const onChange = React.useCallback((position: RoomPositionWithAngle) => {
    setCurrentPosition(position)
  }, [])

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
      onChange={onChange}
      onFinalChange={onFinalChange}
    >
      <AudioTrackIcon/>
      <span onClick={onMuteClicked} className="muteField">{muted ? <IoVolumeMute/> : <IoVolumeHigh/>}</span>
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
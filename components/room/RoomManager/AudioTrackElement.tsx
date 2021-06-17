import { AudioTrack, User } from '@digitalstage/api-client-react'
import { useCallback, useEffect, useState } from 'react'
import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    CustomAudioTrackPosition,
} from '@digitalstage/api-types'
import { ITeckosClient } from 'teckos-client'
import StageElement from './StageElement'
import ElementSelection from './ElementSelection'

const AudioTrackElement = ({
    connection,
    deviceId,
    globalMode,
    offsetX,
    offsetY,
    offsetRz,
    audioTrack,
    customAudioTrack,
    onSelected,
    selected,
    user,
    color,
    audioTrackImage,
}: {
    connection: ITeckosClient
    deviceId: string
    globalMode: boolean
    offsetX: number
    offsetY: number
    offsetRz: number
    audioTrack: AudioTrack
    customAudioTrack?: CustomAudioTrackPosition
    onSelected: (selection: ElementSelection) => void
    selected?: ElementSelection
    user?: User
    color: string
    audioTrackImage: CanvasImageSource
}) => {
    const [position, setPosition] = useState<{ x: number; y: number; rZ: number }>({
        x: offsetX + audioTrack.x,
        y: offsetY + audioTrack.y,
        rZ: offsetRz + audioTrack.rZ,
    })

    useEffect(() => {
        if (!globalMode && customAudioTrack) {
            setPosition({
                x: offsetX + customAudioTrack.x,
                y: offsetY + customAudioTrack.y,
                rZ: offsetRz + customAudioTrack.rZ,
            })
        } else {
            setPosition({
                x: offsetX + audioTrack.x,
                y: offsetY + audioTrack.y,
                rZ: offsetRz + audioTrack.rZ,
            })
        }
    }, [
        globalMode,
        audioTrack.x,
        audioTrack.y,
        audioTrack.rZ,
        customAudioTrack,
        offsetX,
        offsetY,
        offsetRz,
    ])

    useEffect(() => {
        if (selected) {
            if (
                selected.audioTrackId === audioTrack._id &&
                customAudioTrack &&
                !selected.customAudioTrackId
            ) {
                onSelected({
                    ...selected,
                    customAudioTrackId: customAudioTrack._id,
                })
            }
        }
    }, [selected, audioTrack._id, customAudioTrack])

    const commitChanges = useCallback(() => {
        if (connection) {
            if (globalMode) {
                connection.emit(ClientDeviceEvents.ChangeAudioTrack, {
                    _id: audioTrack._id,
                    x: position.x - offsetX,
                    y: position.y - offsetY,
                    rZ: position.rZ - offsetRz,
                } as ClientDevicePayloads.ChangeAudioTrack)
            } else {
                connection.emit(ClientDeviceEvents.SetCustomAudioTrackPosition, {
                    audioTrackId: audioTrack._id,
                    deviceId,
                    x: position.x - offsetX,
                    y: position.y - offsetY,
                    rZ: position.rZ - offsetRz,
                } as ClientDevicePayloads.SetCustomAudioTrackPosition)
            }
        }
    }, [connection, globalMode, audioTrack._id, deviceId, position, offsetX, offsetY, offsetRz])

    return (
        <StageElement
            x={position.x}
            y={position.y}
            rZ={position.rZ}
            size={32}
            image={audioTrackImage}
            onChanged={(currPos) => {
                setPosition(currPos)
            }}
            onChangeFinished={(currPos) => {
                setPosition(currPos)
                commitChanges()
            }}
            selected={
                selected &&
                (selected.type === 'a' || selected.type === 'ca') &&
                selected.audioTrackId === audioTrack._id
            }
            onClick={() =>
                onSelected({
                    audioTrackId: audioTrack._id,
                    customStageDeviceId: customAudioTrack && customAudioTrack._id,
                    type: globalMode ? 'a' : 'ca',
                })
            }
            label={`${user?.name}: ${audioTrack?.name || audioTrack._id}`}
            color={color}
            opacity={globalMode || customAudioTrack ? 1 : 0.6}
        />
    )
}
AudioTrackElement.defaultProps = {
    customAudioTrack: undefined,
    user: undefined,
    selected: undefined,
}
export default AudioTrackElement

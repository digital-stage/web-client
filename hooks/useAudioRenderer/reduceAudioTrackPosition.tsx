import { useEffect, useState } from 'react'
import {
    AudioTrack,
    CustomAudioTrackVolume,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { CustomAudioTrackPosition } from '@digitalstage/api-types'
import reduceStageDevicePosition from './reduceStageDevicePosition'
import Position from './Position'
import Volume from './Volume'

const reduceAudioTrackPosition = (
    audioTrackId: string,
    localDeviceId: string
): {
    position: Position
    volume: Volume
} => {
    const [position, setPosition] = useState<Position>({
        x: 0,
        y: 0,
        rZ: 0,
    })
    const [volume, setVolume] = useState<Volume>({
        volume: 1,
        muted: true,
    })
    // Fetch necessary model
    const audioTrack = useStageSelector<AudioTrack>((state) => state.audioTracks.byId[audioTrackId])
    const { position: stageDevicePosition, volume: stageDeviceVolume } = reduceStageDevicePosition(
        audioTrack.stageDeviceId,
        localDeviceId
    )
    const customAudioTrackPosition = useStageSelector<CustomAudioTrackPosition | undefined>(
        (state) =>
            localDeviceId &&
            audioTrack &&
            state.customAudioTrackPositions.byDeviceAndAudioTrack[localDeviceId] &&
            state.customAudioTrackPositions.byDeviceAndAudioTrack[localDeviceId][audioTrack._id] &&
            state.customAudioTrackPositions.byId[
                state.customAudioTrackPositions.byDeviceAndAudioTrack[localDeviceId][audioTrack._id]
            ]
    )
    const customAudioTrackVolume = useStageSelector<CustomAudioTrackVolume | undefined>(
        (state) =>
            localDeviceId &&
            audioTrack &&
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[localDeviceId] &&
            state.customAudioTrackVolumes.byDeviceAndAudioTrack[localDeviceId][audioTrack._id] &&
            state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[localDeviceId][audioTrack._id]
            ]
    )

    // Calculate position
    useEffect(() => {
        setPosition({
            x: stageDevicePosition.x + (customAudioTrackPosition?.x || audioTrack.x),
            y: stageDevicePosition.y + (customAudioTrackPosition?.y || audioTrack.y),
            rZ: stageDevicePosition.rZ + (customAudioTrackPosition?.rZ || audioTrack.rZ),
        })
    }, [stageDevicePosition, audioTrack, customAudioTrackPosition])

    // Calculate volume
    useEffect(() => {
        setVolume({
            volume:
                (customAudioTrackVolume?.volume || audioTrack.volume) * stageDeviceVolume.volume,
            muted:
                (customAudioTrackVolume ? customAudioTrackVolume.muted : audioTrack.muted) ||
                stageDeviceVolume.muted,
        })
    }, [stageDeviceVolume, audioTrack, customAudioTrackVolume])
    return { volume, position }
}
export default reduceAudioTrackPosition

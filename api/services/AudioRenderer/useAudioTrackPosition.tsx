import { useEffect, useState } from 'react'
import {
    AudioTrack,
    CustomAudioTrackPosition,
    DefaultThreeDimensionalProperties,
    ThreeDimensionalProperties,
} from '@digitalstage/api-types'
import useStageDevicePosition from './useStageDevicePosition'
import { useStageSelector } from 'api/redux/useStageSelector'
import { shallowEqual } from 'react-redux'

const useAudioTrackPosition = ({
    audioTrack,
    deviceId,
}: {
    audioTrack: AudioTrack
    deviceId: string
}) => {
    const [position, setPosition] = useState<ThreeDimensionalProperties>(
        DefaultThreeDimensionalProperties
    )
    const stageDevicePosition = useStageDevicePosition({
        stageDeviceId: audioTrack.stageDeviceId,
        deviceId,
    })
    // Fetch necessary model
    const customAudioTrackPosition = useStageSelector<CustomAudioTrackPosition | undefined>(
        (state) =>
            state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId] &&
            state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId][audioTrack._id]
                ? state.customAudioTrackPositions.byId[
                      state.customAudioTrackPositions.byDeviceAndAudioTrack[deviceId][
                          audioTrack._id
                      ]
                  ]
                : undefined,
        shallowEqual
    )

    // Calculate position
    useEffect(() => {
        // Only calculate if ready and the default entities are available
        setPosition({
            x: stageDevicePosition.x + (customAudioTrackPosition?.x || audioTrack.x),
            y: stageDevicePosition.y + (customAudioTrackPosition?.y || audioTrack.y),
            z: stageDevicePosition.z + (customAudioTrackPosition?.z || audioTrack.z),
            rX: stageDevicePosition.rX + (customAudioTrackPosition?.rX || audioTrack.rX),
            rY: stageDevicePosition.rY + (customAudioTrackPosition?.rY || audioTrack.rY),
            rZ: stageDevicePosition.rZ + (customAudioTrackPosition?.rZ || audioTrack.rZ),
            directivity: customAudioTrackPosition?.directivity || audioTrack.directivity,
        })
    }, [stageDevicePosition, customAudioTrackPosition, audioTrack])

    return position
}
export default useAudioTrackPosition

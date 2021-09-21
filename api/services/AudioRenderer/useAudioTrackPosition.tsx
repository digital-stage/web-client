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

import { useEffect, useState } from 'react'
import {
    AudioTrack,
    CustomAudioTrackPosition,
    DefaultThreeDimensionalProperties,
    ThreeDimensionalProperties,
} from '@digitalstage/api-types'
import { useStageDevicePosition } from './useStageDevicePosition'
import { useStageSelector } from 'api/redux/selectors/useStageSelector'
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
export { useAudioTrackPosition }

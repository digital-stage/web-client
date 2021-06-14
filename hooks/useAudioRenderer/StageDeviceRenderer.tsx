import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context'
import {
    CustomStageDeviceVolume,
    StageDevice,
    useMediasoup,
    useStageSelector,
} from '@digitalstage/api-client-react'
import React, { useEffect, useState } from 'react'
import AudioTrackRenderer from './AudioTrackRenderer'

const StageDeviceRenderer = ({
    id,
    localDeviceId,
    destination,
    audioContext,
}: {
    id: string
    localDeviceId: string
    destination: IAudioNode<IAudioContext>
    audioContext: IAudioContext
}) => {
    const stageDevice = useStageSelector<StageDevice>((state) => state.stageDevices.byId[id])
    const customStageDeviceVolume = useStageSelector<CustomStageDeviceVolume | undefined>(
        (state) =>
            stageDevice &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][stageDevice._id] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][
                    stageDevice._id
                ]
            ]
    )
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()
    const audioTrackIds = useStageSelector<string[]>(
        (state) => state.audioTracks.byStageDevice[id] || []
    )
    const { audioConsumers } = useMediasoup()
    useEffect(() => {
        if (audioContext) {
            let gain = 0
            if (customStageDeviceVolume) {
                gain = customStageDeviceVolume.muted ? 0 : customStageDeviceVolume.volume
            } else {
                gain = stageDevice.muted ? 0 : stageDevice.volume
            }
            setGainNode((prev) => {
                if (!prev) {
                    prev = audioContext.createGain()
                }
                // Calculate gain
                prev.gain.setValueAtTime(gain, audioContext.currentTime)
                return prev
            })
        }
    }, [audioContext, stageDevice.volume, stageDevice.muted, customStageDeviceVolume])
    useEffect(() => {
        if (destination && gainNode) {
            gainNode.connect(destination)
        }
    }, [destination, gainNode])
    return (
        <>
            {Object.keys(audioConsumers)
                .filter((consumerAudioTrackId) =>
                    audioTrackIds.find((audioTrackId) => audioTrackId === consumerAudioTrackId)
                )
                .map((audioTrackId) => (
                    <AudioTrackRenderer
                        key={audioTrackId}
                        id={audioTrackId}
                        consumer={audioConsumers[audioTrackId]}
                        localDeviceId={localDeviceId}
                        destination={gainNode}
                        audioContext={audioContext}
                    />
                ))}
        </>
    )
}
export default StageDeviceRenderer

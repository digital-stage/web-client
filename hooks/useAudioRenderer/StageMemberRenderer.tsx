import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context'
import { StageMember, useStageSelector } from '@digitalstage/api-client-react'
import { CustomStageMemberVolume } from '@digitalstage/api-types'
import React, { useEffect, useState } from 'react'
import StageDeviceRenderer from './StageDeviceRenderer'

const StageMemberRenderer = ({
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
    const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
    const customStageMemberVolume = useStageSelector<CustomStageMemberVolume | undefined>(
        (state) =>
            stageMember &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][stageMember._id] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][
                    stageMember._id
                ]
            ]
    )
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()
    const stageDeviceIds = useStageSelector<string[]>(
        (state) => state.stageDevices.byStageMember[id]
    )
    useEffect(() => {
        if (audioContext) {
            let gain = 0
            if (customStageMemberVolume) {
                gain = customStageMemberVolume.muted ? 0 : customStageMemberVolume.volume
            } else {
                gain = stageMember.muted ? 0 : stageMember.volume
            }
            setGainNode((prev) => {
                if (!prev) {
                    // eslint-disable-next-line no-param-reassign
                    prev = audioContext.createGain()
                }
                // Calculate gain
                prev.gain.setValueAtTime(gain, audioContext.currentTime)
                return prev
            })
        }
    }, [audioContext, stageMember.volume, stageMember.muted, customStageMemberVolume])
    useEffect(() => {
        if (destination && gainNode) {
            gainNode.connect(destination)
        }
    }, [destination, gainNode])
    return (
        <>
            {stageDeviceIds.map((stageDeviceId) => (
                <StageDeviceRenderer
                    key={stageDeviceId}
                    id={stageDeviceId}
                    localDeviceId={localDeviceId}
                    destination={gainNode}
                    audioContext={audioContext}
                />
            ))}
        </>
    )
}

export default StageMemberRenderer

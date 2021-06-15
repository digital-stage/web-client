import { IAudioContext, IAudioNode, IGainNode } from 'standardized-audio-context'
import { useStageSelector } from '@digitalstage/api-client-react'
import { CustomGroupVolume, Group } from '@digitalstage/api-types'
import React, { useEffect, useState } from 'react'
import StageMemberRenderer from './StageMemberRenderer'

const GroupRenderer = ({
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
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const customGroupVolume = useStageSelector<CustomGroupVolume | undefined>(
        (state) =>
            localDeviceId &&
            group &&
            state.customGroupVolumes.byDeviceAndGroup[localDeviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[localDeviceId][group._id] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[localDeviceId][group._id]
            ]
    )
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()
    const stageMemberIds = useStageSelector<string[]>((state) => state.stageMembers.byGroup[id])

    useEffect(() => {
        if (audioContext) {
            let gain = 0
            if (customGroupVolume) {
                gain = customGroupVolume.muted ? 0 : customGroupVolume.volume
            } else {
                gain = group.muted ? 0 : group.volume
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
    }, [audioContext, group.volume, group.muted, customGroupVolume])

    useEffect(() => {
        if (gainNode && destination) {
            gainNode.connect(destination)
        }
    }, [destination, gainNode])

    return (
        <>
            {stageMemberIds.map((stageMemberId) => (
                <StageMemberRenderer
                    key={stageMemberId}
                    id={stageMemberId}
                    localDeviceId={localDeviceId}
                    destination={gainNode}
                    audioContext={audioContext}
                />
            ))}
        </>
    )
}
export default GroupRenderer

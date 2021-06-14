/* eslint-disable no-param-reassign */
import { useStageSelector } from '@digitalstage/api-client-react'
import React, { useEffect, useState } from 'react'
import { IAudioContext, IAudioNode } from 'standardized-audio-context'
import useAudioContext from '../useAudioContext'
import Position from './Position'
import Volume from './Volume'
import reduceStageDevicePosition from './reduceStageDevicePosition'
import GroupRenderer from './GroupRenderer'

const ListenerRenderer = ({
    localDeviceId,
    stageDeviceId,
}: {
    localDeviceId: string
    stageDeviceId: string
}): JSX.Element => {
    const { position } = reduceStageDevicePosition(stageDeviceId, localDeviceId)
    const { audioContext } = useAudioContext()

    useEffect(() => {
        if (audioContext) {
            audioContext.listener.positionX.setValueAtTime(position.x, audioContext.currentTime)
            audioContext.listener.positionY.setValueAtTime(position.y, audioContext.currentTime)
            audioContext.listener.positionZ.setValueAtTime(1, audioContext.currentTime)
            // TODO: Calculate rotation into vector
            audioContext.listener.forwardZ.setValueAtTime(position.rZ, audioContext.currentTime)
        }
    }, [audioContext, position.x, position.y, position.rZ])

    return null
}

const StageRenderer = ({ stageId, localDeviceId }: { stageId: string; localDeviceId: string }) => {
    const { audioContext, destination, started } = useAudioContext()
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[stageId])
    const [channelMerger, setChannelMerger] = useState<IAudioNode<IAudioContext>>()
    const stageDeviceId = useStageSelector<string | undefined>(
        (state) =>
            state.stageDevices.byStageAndDevice[stageId] &&
            state.stageDevices.byStageAndDevice[stageId][localDeviceId]
    )

    useEffect(() => {
        if (audioContext && destination) {
            const merger = audioContext.createChannelMerger(2)
            merger.connect(destination)
            setChannelMerger(merger)
            return () => {
                merger.disconnect(destination)
            }
        }
        return undefined
    }, [audioContext, destination])

    if (audioContext && started) {
        return (
            <>
                {stageDeviceId && (
                    <ListenerRenderer stageDeviceId={stageDeviceId} localDeviceId={localDeviceId} />
                )}
                {groupIds.map((id) => (
                    <GroupRenderer
                        key={id}
                        id={id}
                        localDeviceId={localDeviceId}
                        destination={channelMerger}
                        audioContext={audioContext}
                    />
                ))}
            </>
        )
    }
    return null
}

const AudioRendererProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const stageId = useStageSelector<string>((state) => state.globals.stageId)
    const localDeviceId = useStageSelector<string>((state) => state.globals.localDeviceId)

    return (
        <>
            {ready && stageId && localDeviceId && (
                <>
                    <StageRenderer stageId={stageId} localDeviceId={localDeviceId} />
                </>
            )}
            {children}
        </>
    )
}

export type { Volume, Position }
export default AudioRendererProvider

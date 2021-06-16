import React, { createContext, useContext, useEffect, useState } from 'react'
import {
    IAnalyserNode,
    IAudioContext,
    IAudioNode,
    IGainNode,
    IOscillatorNode,
    IPannerNode,
} from 'standardized-audio-context'
import {
    CustomStageDeviceVolume,
    StageDevice,
    StageMember,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { CustomGroupVolume, CustomStageMemberVolume, Group } from '@digitalstage/api-types'
import useAudioContext from '../hooks/useAudioContext'
import reducePosition from './reducePosition'

interface AudioRenderContext {
    analyser: {
        [id: string]: IAnalyserNode<IAudioContext>
    }
    setAnalyser: React.Dispatch<React.SetStateAction<{ [p: string]: IAnalyserNode<IAudioContext> }>>
}

const Context = createContext<AudioRenderContext>({
    analyser: {},
    setAnalyser: () => {
        throw new Error('Please wrap your DOM tree inside an AudioRenderProvider')
    },
})

const AudioTrackRenderer = ({
    audioTrackId,
    audioContext,
    destination,
    deviceId,
}: {
    audioTrackId: string
    audioContext: IAudioContext
    destination: IAudioNode<IAudioContext>
    deviceId: string
}): JSX.Element => {
    const audioTrack = useStageSelector((state) => state.audioTracks.byId[audioTrackId])

    return <audio />
}

const StageDeviceRenderer = ({
    stageDeviceId,
    audioContext,
    destination,
    deviceId,
}: {
    stageDeviceId: string
    audioContext: IAudioContext
    destination: IAudioNode<IAudioContext>
    deviceId: string
}): JSX.Element => {
    // const audioTrackIds = useStageSelector(state => state.audioTracks.byStageDevice[stageDeviceId] || [])
    // return (<>{audioTrackIds.map(audioTrackId => <AudioTrackRenderer audioTrackId={audioTrackId} audioContext={audioContext}/>)}</>)
    const stageDevice = useStageSelector<StageDevice>(
        (state) => state.stageDevices.byId[stageDeviceId]
    )
    const customVolume = useStageSelector<CustomStageDeviceVolume | undefined>(
        (state) =>
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[deviceId][stageDeviceId]
            ]
    )
    const [pannerNode, setPannerNode] = useState<IPannerNode<IAudioContext>>()
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()
    const [oscillator, setOscillator] = useState<IOscillatorNode<IAudioContext>>()
    const position = reducePosition({ stageDeviceId, deviceId })
    const stage = useStageSelector((state) => state.stages.byId[stageDevice.stageId])

    useEffect(() => {
        if (audioContext) {
            const node = audioContext.createOscillator()
            node.type = 'square'
            node.frequency.setValueAtTime(
                Math.floor(Math.random() * 2000) + 400,
                audioContext.currentTime
            ) // value in hertz
            node.start()
            setOscillator(node)
        }
    }, [audioContext])

    useEffect(() => {
        if (audioContext) {
            setGainNode(audioContext.createGain())
        }
    }, [audioContext])

    useEffect(() => {
        if (audioContext) {
            const node = audioContext.createPanner()
            node.panningModel = 'HRTF'
            node.distanceModel = 'inverse'
            node.maxDistance = 10000
            node.refDistance = 1
            node.rolloffFactor = 1
            node.coneInnerAngle = 360
            node.coneOuterAngle = 0
            node.coneOuterGain = 0
            setPannerNode(node)
        }
    }, [audioContext])

    useEffect(() => {
        if (oscillator && pannerNode) {
            oscillator.connect(pannerNode)
            return () => {
                oscillator.disconnect(pannerNode)
            }
        }
        return undefined
    }, [oscillator, pannerNode])

    useEffect(() => {
        if (pannerNode && gainNode) {
            pannerNode.connect(gainNode)
            return () => {
                pannerNode.disconnect(gainNode)
            }
        }
        return undefined
    }, [pannerNode, gainNode])

    useEffect(() => {
        if (gainNode && destination) {
            gainNode.connect(destination)
            return () => {
                gainNode.disconnect(destination)
            }
        }
        return undefined
    }, [gainNode, destination])

    useEffect(() => {
        if (audioContext && gainNode) {
            if (customVolume?.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else if (customVolume?.volume) {
                gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
            } else if (stageDevice.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else {
                gainNode.gain.setValueAtTime(stageDevice.volume, audioContext.currentTime)
            }
        }
    }, [
        audioContext,
        gainNode,
        stageDevice.volume,
        stageDevice.muted,
        customVolume?.volume,
        customVolume?.muted,
    ])

    useEffect(() => {
        if (audioContext && pannerNode) {
            pannerNode.positionX.setValueAtTime(position.x, audioContext.currentTime)
            pannerNode.positionY.setValueAtTime(position.y, audioContext.currentTime)
            pannerNode.positionZ.setValueAtTime(position.z, audioContext.currentTime)
            pannerNode.orientationX.setValueAtTime(position.rX, audioContext.currentTime)
            pannerNode.orientationY.setValueAtTime(position.rY, audioContext.currentTime)
            pannerNode.orientationZ.setValueAtTime(position.rZ, audioContext.currentTime)
            if (position.directivity === 'cardoid') {
                // eslint-disable-next-line no-param-reassign
                pannerNode.coneInnerAngle = 90
                // eslint-disable-next-line no-param-reassign
                pannerNode.coneOuterAngle = 360
            } else {
                // eslint-disable-next-line no-param-reassign
                pannerNode.coneInnerAngle = 180
                // eslint-disable-next-line no-param-reassign
                pannerNode.coneOuterAngle = 360
                pannerNode.coneOuterGain = 0.5
            }
        }
    }, [audioContext, pannerNode, position])

    useEffect(() => {
        if (stage && pannerNode) {
            pannerNode.maxDistance = Math.max(stage.width, stage.height)
        }
    }, [stage, pannerNode])

    return null
}
const StageMemberRenderer = ({
    stageMemberId,
    audioContext,
    destination,
    deviceId,
}: {
    stageMemberId: string
    audioContext: IAudioContext
    destination: IAudioNode<IAudioContext>
    deviceId: string
}): JSX.Element => {
    const stageDeviceIds = useStageSelector(
        (state) => state.stageDevices.byStageMember[stageMemberId] || []
    )
    const stageMember = useStageSelector<StageMember>(
        (state) => state.stageMembers.byId[stageMemberId]
    )
    const customVolume = useStageSelector<CustomStageMemberVolume | undefined>(
        (state) =>
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[deviceId][stageMemberId]
            ]
    )
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()

    useEffect(() => {
        if (audioContext) {
            setGainNode(audioContext.createGain())
        }
    }, [audioContext])

    useEffect(() => {
        if (destination && gainNode) {
            gainNode.connect(destination)
            return () => {
                gainNode.disconnect(destination)
            }
        }
        return undefined
    }, [gainNode, destination])

    useEffect(() => {
        if (audioContext && gainNode) {
            if (customVolume?.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else if (customVolume?.volume) {
                gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
            } else if (stageMember.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else {
                gainNode.gain.setValueAtTime(stageMember.volume, audioContext.currentTime)
            }
        }
    }, [
        audioContext,
        gainNode,
        stageMember.volume,
        stageMember.muted,
        customVolume?.volume,
        customVolume?.muted,
    ])

    return (
        <>
            {stageDeviceIds.map((stageDeviceId) => (
                <StageDeviceRenderer
                    stageDeviceId={stageDeviceId}
                    audioContext={audioContext}
                    destination={gainNode}
                    deviceId={deviceId}
                />
            ))}
        </>
    )
}
const GroupRenderer = ({
    groupId,
    audioContext,
    destination,
    deviceId,
}: {
    groupId: string
    audioContext: IAudioContext
    destination: IAudioNode<IAudioContext>
    deviceId: string
}): JSX.Element => {
    const stageMemberIds = useStageSelector((state) => state.stageMembers.byGroup[groupId] || [])
    const group = useStageSelector<Group>((state) => state.groups.byId[groupId])
    const customVolume = useStageSelector<CustomGroupVolume | undefined>(
        (state) =>
            state.customGroupVolumes.byDeviceAndGroup[deviceId] &&
            state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId] &&
            state.customGroupVolumes.byId[
                state.customGroupVolumes.byDeviceAndGroup[deviceId][groupId]
            ]
    )
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()

    useEffect(() => {
        if (audioContext) {
            setGainNode(audioContext.createGain())
        }
    }, [audioContext])

    useEffect(() => {
        if (destination && gainNode) {
            gainNode.connect(destination)
            return () => {
                gainNode.disconnect(destination)
            }
        }
        return undefined
    }, [gainNode, destination])

    useEffect(() => {
        if (audioContext && gainNode) {
            if (customVolume?.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else if (customVolume?.volume) {
                gainNode.gain.setValueAtTime(customVolume.volume, audioContext.currentTime)
            } else if (group.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else {
                gainNode.gain.setValueAtTime(group.volume, audioContext.currentTime)
            }
        }
    }, [
        audioContext,
        gainNode,
        group.volume,
        group.muted,
        customVolume?.volume,
        customVolume?.muted,
    ])

    return (
        <>
            {stageMemberIds.map((stageMemberId) => (
                <StageMemberRenderer
                    stageMemberId={stageMemberId}
                    audioContext={audioContext}
                    destination={gainNode}
                    deviceId={deviceId}
                />
            ))}
        </>
    )
}

const ListenerRenderer = ({
    audioContext,
    stageDeviceId,
    deviceId,
}: {
    audioContext: IAudioContext
    stageDeviceId: string
    deviceId: string
}): JSX.Element => {
    const position = reducePosition({ stageDeviceId, deviceId })

    useEffect(() => {
        if (audioContext) {
            console.log('[AudioRenderer] Changed position of listener')
            audioContext.listener.positionX.setValueAtTime(position.x, audioContext.currentTime)
            audioContext.listener.positionY.setValueAtTime(position.y, audioContext.currentTime)
            audioContext.listener.positionZ.setValueAtTime(position.z, audioContext.currentTime)
            audioContext.listener.forwardX.setValueAtTime(position.rX, audioContext.currentTime)
            audioContext.listener.forwardY.setValueAtTime(position.rY, audioContext.currentTime)
            audioContext.listener.forwardZ.setValueAtTime(position.rZ, audioContext.currentTime)
        }
    }, [audioContext, position])

    return null
}

const StageRenderer = ({
    stageId,
    audioContext,
    destination,
    deviceId,
}: {
    stageId: string
    audioContext: IAudioContext
    destination: IAudioNode<IAudioContext>
    deviceId: string
}): JSX.Element => {
    const groupIds = useStageSelector((state) => state.groups.byStage[stageId] || [])
    const stageDeviceId = useStageSelector<string | undefined>(
        (state) =>
            state.stageDevices.byStageAndDevice[stageId] &&
            state.stageDevices.byStageAndDevice[stageId][deviceId]
    )

    return (
        <>
            <ListenerRenderer
                audioContext={audioContext}
                stageDeviceId={stageDeviceId}
                deviceId={deviceId}
            />
            {groupIds.map((groupId) => (
                <GroupRenderer
                    groupId={groupId}
                    audioContext={audioContext}
                    destination={destination}
                    deviceId={deviceId}
                />
            ))}
        </>
    )
}

const AudioRenderProvider = ({ children }: { children: React.ReactNode }) => {
    const [analyser, setAnalyser] = useState<{ [id: string]: IAnalyserNode<IAudioContext> }>()
    const stageId = useStageSelector<string | undefined>((state) => state.globals.stageId)
    const { audioContext, started, destination } = useAudioContext()
    const localDeviceId = useStageSelector<string>((state) => state.globals.localDeviceId)

    return (
        <Context.Provider value={{ analyser, setAnalyser }}>
            {children}
            {stageId && started && (
                <StageRenderer
                    stageId={stageId}
                    audioContext={audioContext}
                    destination={destination}
                    deviceId={localDeviceId}
                />
            )}
        </Context.Provider>
    )
}

const useAudioRenderer = () => useContext(Context)

export { AudioRenderProvider }

export default useAudioRenderer

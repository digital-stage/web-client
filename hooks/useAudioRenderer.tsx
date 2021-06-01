/* eslint-disable no-param-reassign */
import {
    AudioTrack,
    CustomAudioTrackVolume,
    CustomStageDevicePosition,
    CustomStageDeviceVolume,
    StageDevice,
    StageMember,
    useMediasoup,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import {
    CustomAudioTrackPosition,
    CustomGroupPosition,
    CustomGroupVolume,
    CustomStageMemberPosition,
    CustomStageMemberVolume,
    Group,
} from '@digitalstage/api-types'
import React, { useEffect, useRef, useState } from 'react'
import {
    IAudioContext,
    IGainNode,
    IMediaElementAudioSourceNode,
    IPannerNode,
} from 'standardized-audio-context'
import useAudioContext from './useAudioContext'

interface Position {
    x: number
    y: number
    rZ: number
}
interface Volume {
    volume: number
    muted: boolean
}

const reduceStageDevicePosition = (
    stageDeviceId?: string
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
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )
    const stageDevice = useStageSelector<StageDevice | undefined>(
        (state) => stageDeviceId && state.stageDevices.byId[stageDeviceId]
    )
    const customStageDevicePosition = useStageSelector<CustomStageDevicePosition | undefined>(
        (state) =>
            localDeviceId &&
            stageDevice &&
            state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId] &&
            state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId][
                stageDevice._id
            ] &&
            state.customStageDevicePositions.byId[
                state.customStageDevicePositions.byDeviceAndStageDevice[localDeviceId][
                    stageDevice._id
                ]
            ]
    )
    const customStageDeviceVolume = useStageSelector<CustomStageDeviceVolume | undefined>(
        (state) =>
            localDeviceId &&
            stageDevice &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId] &&
            state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][stageDevice._id] &&
            state.customStageDeviceVolumes.byId[
                state.customStageDeviceVolumes.byDeviceAndStageDevice[localDeviceId][
                    stageDevice._id
                ]
            ]
    )
    const stageMember = useStageSelector<StageMember | undefined>(
        (state) => stageDevice && state.stageMembers.byId[stageDevice.stageMemberId]
    )
    const customStageMemberPosition = useStageSelector<CustomStageMemberPosition | undefined>(
        (state) =>
            localDeviceId &&
            stageMember &&
            state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId] &&
            state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId][
                stageMember._id
            ] &&
            state.customStageMemberPositions.byId[
                state.customStageMemberPositions.byDeviceAndStageMember[localDeviceId][
                    stageMember._id
                ]
            ]
    )
    const customStageMemberVolume = useStageSelector<CustomStageMemberVolume | undefined>(
        (state) =>
            localDeviceId &&
            stageMember &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId] &&
            state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][stageMember._id] &&
            state.customStageMemberVolumes.byId[
                state.customStageMemberVolumes.byDeviceAndStageMember[localDeviceId][
                    stageMember._id
                ]
            ]
    )
    const group = useStageSelector<Group>((state) => state.groups.byId[stageMember.groupId])
    const customGroupPosition = useStageSelector<CustomGroupPosition | undefined>(
        (state) =>
            localDeviceId &&
            group &&
            state.customGroupPositions.byDeviceAndGroup[localDeviceId] &&
            state.customGroupPositions.byDeviceAndGroup[localDeviceId][group._id] &&
            state.customGroupPositions.byId[
                state.customGroupPositions.byDeviceAndGroup[localDeviceId][group._id]
            ]
    )
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

    // Calculate position
    useEffect(() => {
        if (ready) {
            let x = customGroupPosition?.x || group.x
            let y = customGroupPosition?.y || group.y
            let rZ = customGroupPosition?.rZ || group.rZ
            x += customStageMemberPosition?.x || stageMember.x
            y += customStageMemberPosition?.y || stageMember.y
            rZ += customStageMemberPosition?.rZ || stageMember.rZ
            x += customStageDevicePosition?.x || stageDevice.x
            y += customStageDevicePosition?.y || stageDevice.y
            rZ += customStageDevicePosition?.rZ || stageDevice.rZ
            setPosition({
                x,
                y,
                rZ,
            })
        }
    }, [
        ready,
        group,
        customGroupPosition,
        stageMember,
        customStageMemberPosition,
        stageDevice,
        customStageDevicePosition,
    ])

    // Calculate volume
    useEffect(() => {
        if (ready) {
            let calculatedVolume = customGroupVolume?.volume || group.volume
            calculatedVolume *= customStageMemberVolume?.volume || stageMember.volume
            calculatedVolume *= customStageDeviceVolume?.volume || stageDevice.volume

            const muted =
                (customStageDeviceVolume ? customStageDeviceVolume.muted : stageDevice.muted) ||
                (customStageMemberVolume ? customStageMemberVolume.muted : stageMember.muted) ||
                (customGroupVolume ? customGroupVolume.muted : group.muted)
            setVolume({
                volume: calculatedVolume,
                muted,
            })
        }
    }, [
        ready,
        group,
        customGroupVolume,
        stageMember,
        customStageMemberVolume,
        stageDevice,
        customStageDeviceVolume,
    ])
    return {
        position,
        volume,
    }
}

const reduceAudioTrackPosition = (
    audioTrackId?: string
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
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => state.globals.localDeviceId
    )
    const audioTrack = useStageSelector<AudioTrack | undefined>(
        (state) => audioTrackId && state.audioTracks.byId[audioTrackId]
    )
    const { position: stageDevicePosition, volume: stageDeviceVolume } = reduceStageDevicePosition(
        audioTrack && audioTrack.stageDeviceId
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
        if (ready)
            setPosition({
                x: stageDevicePosition.x + (customAudioTrackPosition?.x || audioTrack.x),
                y: stageDevicePosition.y + (customAudioTrackPosition?.y || audioTrack.y),
                rZ: stageDevicePosition.rZ + (customAudioTrackPosition?.rZ || audioTrack.rZ),
            })
    }, [ready, stageDevicePosition, audioTrack, customAudioTrackPosition])

    // Calculate volume
    useEffect(() => {
        if (ready)
            setVolume({
                volume:
                    (customAudioTrackVolume?.volume || audioTrack.volume) *
                    stageDeviceVolume.volume,
                muted:
                    (customAudioTrackVolume ? customAudioTrackVolume.muted : audioTrack.muted) ||
                    stageDeviceVolume.muted,
            })
    }, [ready, stageDeviceVolume, audioTrack, customAudioTrackVolume])
    return { volume, position }
}

const ConsumerRenderer = ({
    consumer,
    audioTrackId,
}: {
    consumer: Consumer
    audioTrackId: string
}) => {
    const audioRef = useRef<HTMLAudioElement>()
    const { audioContext, destination } = useAudioContext()
    const { position, volume } = reduceAudioTrackPosition(audioTrackId)
    const { track } = consumer
    const [sourceNode, setSourceNode] = useState<IMediaElementAudioSourceNode<IAudioContext>>()
    const [, setGainNode] = useState<IGainNode<IAudioContext>>()
    const [, setPannerNode] = useState<IPannerNode<IAudioContext>>()

    const [element, setElement] = useState<HTMLAudioElement>()

    useEffect(() => {
        if (audioContext && track) {
            const audioElement = new Audio()
            audioElement.id = audioTrackId
            audioElement.srcObject = new MediaStream([track])
            audioElement.autoplay = true
            audioElement.muted = true
            setElement(audioElement)
            const source = audioContext.createMediaElementSource(audioRef.current)
            setSourceNode(source)
        }
    }, [track, audioContext])
    /*
    useEffect(() => {
        if (audioRef.current && audioContext && track) {
            audioRef.current.srcObject = new MediaStream([track])
            audioRef.current.autoplay = true
            audioRef.current.muted = true
            audioRef.current.play()
            const source = audioContext.createMediaElementSource(audioRef.current)
            setSourceNode(source)
        }
    }, [audioRef, track, audioContext]) */

    useEffect(() => {
        if (sourceNode && audioContext && track) {
            console.log('CONNECTING NODES')
            const gain = audioContext.createGain()
            gain.gain.value = 1
            const panner = audioContext.createPanner()
            // sourceNode.connect(panner).connect(gain).connect(destination)
            sourceNode.connect(destination)
            setGainNode(gain)
            setPannerNode(panner)
            return () => {
                console.log('DISCONNECTING NODES')
                // sourceNode.disconnect(panner)
                // panner.disconnect(gain)
                // gain.disconnect(destination)
                sourceNode.disconnect(destination)
            }
        }
        return undefined
    }, [sourceNode, audioContext, destination])

    useEffect(() => {
        console.log('UPDATE PANNER')
        console.log(position)
        setPannerNode((prev) => {
            if (prev) {
                prev.positionX.value = position.x
                prev.positionY.value = position.y
                prev.orientationZ.value = position.rZ
            }
            return prev
        })
    }, [position])

    useEffect(() => {
        setGainNode((prev) => {
            if (prev) {
                console.log('UPDATE GAIN')
                console.log(volume)
                if (volume.muted) {
                    console.log('muted')
                    prev.gain.setValueAtTime(0, audioContext.currentTime)
                } else {
                    prev.gain.setValueAtTime(volume.volume, audioContext.currentTime)
                }
            }
            return prev
        })
    }, [audioContext, volume])

    return (
        <audio ref={audioRef}>
            <track kind="captions" />
        </audio>
    )
}

const Listener = (): JSX.Element => {
    const ready = useStageSelector<boolean>((state) => state.globals.ready)
    const localDeviceId = useStageSelector<string | undefined>(
        (state) => ready && state.globals.localDeviceId
    )
    const stageDeviceId = useStageSelector<string | undefined>(
        (state) =>
            localDeviceId &&
            state.stageDevices.allIds.find(
                (id) => state.stageDevices.byId[id].deviceId === localDeviceId
            )
    )
    const { position } = reduceStageDevicePosition(stageDeviceId)
    const { audioContext } = useAudioContext()

    useEffect(() => {
        if (audioContext) {
            const { listener } = audioContext
            listener.positionX.value = position.x
            listener.positionY.value = position.y
            listener.positionZ.value = 1
            // TODO: Calculate rotation into vector
            listener.forwardZ.value = position.rZ
        }
    }, [audioContext, position.x, position.y, position.rZ])

    return null
}

const AudioRendererProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const { audioConsumers } = useMediasoup()
    const ready = useStageSelector<boolean>((state) => state.globals.ready)

    return (
        <>
            {ready && <Listener />}
            {ready &&
                Object.entries(audioConsumers).map(([audioTrackId, consumer]) => (
                    <ConsumerRenderer
                        key={audioTrackId}
                        audioTrackId={audioTrackId}
                        consumer={consumer}
                    />
                ))}
            {children}
        </>
    )
}
export default AudioRendererProvider

/* eslint-disable no-param-reassign */
import {
    AudioTrack,
    CustomAudioTrackVolume,
    useMediasoup,
    useStageSelector,
} from '@digitalstage/api-client-react'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import { CustomAudioTrackPosition } from '@digitalstage/api-types'
import React, { useEffect, useRef, useState } from 'react'
import {
    IAudioContext,
    IGainNode,
    IMediaStreamAudioSourceNode,
    IPannerNode,
} from 'standardized-audio-context'
import reduceAudioTrackPosition from './reduceAudioTrackPosition'
import useAudioContext from '../useAudioContext'
import Position from './Position'
import Volume from './Volume'
import Listener from './Listener'

const ConsumerRenderer = ({
    consumer,
    audioTrackId,
}: {
    consumer: Consumer
    audioTrackId: string
}) => {
    const audioRef = useRef<HTMLAudioElement>()
    const { audioContext, destination, started } = useAudioContext()
    const { position, volume } = reduceAudioTrackPosition(audioTrackId)
    const { track } = consumer
    const [sourceNode, setSourceNode] = useState<IMediaStreamAudioSourceNode<IAudioContext>>()
    const [, setGainNode] = useState<IGainNode<IAudioContext>>()
    const [, setPannerNode] = useState<IPannerNode<IAudioContext>>()

    useEffect(() => {
        if (audioRef.current && audioContext && track && started) {
            const stream = new MediaStream([track])
            audioRef.current.srcObject = stream
            audioRef.current.autoplay = true
            audioRef.current.muted = true
            audioRef.current.play().catch((err) => console.error(err))
            const source = audioContext.createMediaStreamSource(stream)
            setSourceNode(source)
        }
    }, [audioRef, track, audioContext, started])

    useEffect(() => {
        if (sourceNode && audioContext && track) {
            console.log('CONNECTING NODES')
            const gain = audioContext.createGain()
            gain.gain.value = 1
            const panner = audioContext.createPanner()
            sourceNode.connect(panner).connect(gain).connect(destination)
            // sourceNode.connect(destination)
            setGainNode(gain)
            setPannerNode(panner)
            return () => {
                console.log('DISCONNECTING NODES')
                sourceNode.disconnect(panner)
                panner.disconnect(gain)
                gain.disconnect(destination)
                // sourceNode.disconnect(destination)
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

// TODO: Group nodes like on canvas renderer
const ConsumerRenderer2 = ({
    consumer,
    audioTrackId,
    relativePosition,
    relativeVolume,
    destinationL,
    destinationR,
}: {
    consumer: Consumer
    audioTrackId: string
    relativePosition: Position
    relativeVolume: Volume
    destinationL: IGainNode<IAudioContext>
    destinationR: IGainNode<IAudioContext>
}) => {
    const audioRef = useRef<HTMLAudioElement>()
    const { audioContext, started } = useAudioContext()
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
                x: relativePosition.x + (customAudioTrackPosition?.x || audioTrack.x),
                y: relativePosition.y + (customAudioTrackPosition?.y || audioTrack.y),
                rZ: relativePosition.rZ + (customAudioTrackPosition?.rZ || audioTrack.rZ),
            })
    }, [ready, relativePosition, audioTrack, customAudioTrackPosition])

    // Calculate volume
    useEffect(() => {
        if (ready)
            setVolume({
                volume:
                    (customAudioTrackVolume?.volume || audioTrack.volume) * relativeVolume.volume,
                muted:
                    (customAudioTrackVolume ? customAudioTrackVolume.muted : audioTrack.muted) ||
                    relativeVolume.muted,
            })
    }, [ready, relativeVolume, audioTrack, customAudioTrackVolume])
    const { track } = consumer
    const [sourceNode, setSourceNode] = useState<IMediaStreamAudioSourceNode<IAudioContext>>()
    const [, setGainNode] = useState<IGainNode<IAudioContext>>()
    const [, setPannerNode] = useState<IPannerNode<IAudioContext>>()

    useEffect(() => {
        if (audioRef.current && audioContext && track && started) {
            const stream = new MediaStream([track])
            audioRef.current.srcObject = stream
            audioRef.current.autoplay = true
            audioRef.current.muted = true
            audioRef.current.play().catch((err) => console.error(err))
            const source = audioContext.createMediaStreamSource(stream)
            setSourceNode(source)
        }
    }, [audioRef, track, audioContext, started])

    useEffect(() => {
        if (sourceNode && audioContext && track && destinationL && destinationR) {
            console.log('CONNECTING NODES')
            const gain = audioContext.createGain()
            gain.gain.value = 1
            const panner = audioContext.createPanner()
            sourceNode.connect(gain)
            gain.connect(panner)
            panner.connect(destinationL, 0)
            panner.connect(destinationR, 1)
            // sourceNode.connect(destination)
            setGainNode(gain)
            setPannerNode(panner)
            return () => {
                console.log('DISCONNECTING NODES')
                sourceNode.disconnect(gain)
                gain.disconnect(panner)
                panner.disconnect(destinationL, 0)
                panner.disconnect(destinationR, 1)
                // sourceNode.disconnect(destination)
            }
        }
        return undefined
    }, [sourceNode, audioContext, destinationL, destinationR])

    useEffect(() => {
        if (audioContext)
            setPannerNode((prev) => {
                if (prev) {
                    console.log('UPDATE PANNER')
                    prev.positionX.setValueAtTime(position.x, audioContext.currentTime)
                    prev.positionY.setValueAtTime(position.y, audioContext.currentTime)
                    prev.orientationZ.setValueAtTime(position.rZ, audioContext.currentTime)
                }
                return prev
            })
    }, [audioContext, position])

    useEffect(() => {
        if (audioContext)
            setGainNode((prev) => {
                if (prev) {
                    console.log('UPDATE GAIN')
                    if (volume.muted || relativeVolume.muted) {
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

const AudioRendererProvider = ({ children }: { children: React.ReactNode }): JSX.Element => {
    const { audioConsumers } = useMediasoup()
    const ready = useStageSelector<boolean>((state) => state.globals.ready)

    return (
        <>
            {ready && (
                <>
                    <Listener />
                    {Object.entries(audioConsumers).map(([audioTrackId, consumer]) => (
                        <ConsumerRenderer
                            key={audioTrackId}
                            audioTrackId={audioTrackId}
                            consumer={consumer}
                        />
                    ))}
                </>
            )}
            {children}
        </>
    )
}

export type { Volume, Position }
export default AudioRendererProvider

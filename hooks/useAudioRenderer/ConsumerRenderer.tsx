import React, { useEffect, useRef, useState } from 'react'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import {
    IAudioContext,
    IGainNode,
    IMediaStreamAudioSourceNode,
    IPannerNode,
} from 'standardized-audio-context'
import { useStageSelector } from '@digitalstage/api-client-react'
import useAudioContext from '../useAudioContext'
import reduceAudioTrackPosition from './reduceAudioTrackPosition'

const ConsumerRenderer = ({
    consumer,
    audioTrackId,
}: {
    consumer: Consumer
    audioTrackId: string
}) => {
    const audioRef = useRef<HTMLAudioElement>()
    const { audioContext, destination, started } = useAudioContext()
    const localDeviceId = useStageSelector((state) => state.globals.localDeviceId)
    const { position, volume } = reduceAudioTrackPosition(audioTrackId, localDeviceId)
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

export default ConsumerRenderer

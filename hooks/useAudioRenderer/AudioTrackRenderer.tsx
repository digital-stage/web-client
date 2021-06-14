import {
    IAudioContext,
    IAudioNode,
    IGainNode,
    IMediaStreamAudioSourceNode,
    IPannerNode,
} from 'standardized-audio-context'
import React, { useEffect, useRef, useState } from 'react'
import { Consumer } from 'mediasoup-client/lib/Consumer'
import reduceAudioTrackPosition from './reduceAudioTrackPosition'

const AudioTrackRenderer = ({
    id,
    consumer,
    localDeviceId,
    destination,
    audioContext,
}: {
    id: string
    consumer: Consumer
    localDeviceId: string
    destination: IAudioNode<IAudioContext>
    audioContext: IAudioContext
}) => {
    const audioRef = useRef<HTMLAudioElement>()
    const { position, volume } = reduceAudioTrackPosition(id, localDeviceId)
    const { track } = consumer
    const [sourceNode, setSourceNode] = useState<IMediaStreamAudioSourceNode<IAudioContext>>()
    const [gainNode, setGainNode] = useState<IGainNode<IAudioContext>>()
    const [pannerNode, setPannerNode] = useState<IPannerNode<IAudioContext>>()

    useEffect(() => {
        if (audioRef.current && audioContext && track) {
            const stream = new MediaStream([track])
            audioRef.current.srcObject = stream
            audioRef.current.autoplay = true
            audioRef.current.muted = true
            audioRef.current.play().catch((err) => console.error(err))
            const source = audioContext.createMediaStreamSource(stream)
            setSourceNode(source)
        }
    }, [audioRef, track, audioContext])

    useEffect(() => {
        if (sourceNode && gainNode) {
            console.log('CONNECTING SOURCE TO GAIN NODE')
            sourceNode.connect(gainNode)
            return () => {
                console.log('DISCONNECTING SOURCE FROM GAIN NODE')
                sourceNode.disconnect(gainNode)
            }
        }
        return undefined
    }, [sourceNode, gainNode])

    useEffect(() => {
        if (gainNode && pannerNode) {
            console.log('CONNECTING GAIN TO PANNER NODE')
            gainNode.connect(pannerNode)
            return () => {
                console.log('DISCONNECTING GAIN FROM PANNER NODE')
                gainNode.disconnect(pannerNode)
            }
        }
        return undefined
    }, [gainNode, pannerNode])

    useEffect(() => {
        if (pannerNode && destination) {
            console.log('CONNECTING PANNER TO DESTINATION')
            pannerNode.connect(destination)
            return () => {
                console.log('DISCONNECTING PANNER FROM DESTINATION')
                pannerNode.disconnect(destination)
            }
        }
        return undefined
    }, [pannerNode, destination])

    useEffect(() => {
        if (audioContext)
            setPannerNode((prev) => {
                console.log('UPDATE PANNER')
                console.log(position)
                if (!prev) {
                    // eslint-disable-next-line no-param-reassign
                    prev = audioContext.createPanner()
                }
                prev.positionX.setValueAtTime(position.x, audioContext.currentTime)
                prev.positionY.setValueAtTime(position.y, audioContext.currentTime)
                prev.orientationZ.setValueAtTime(position.rZ, audioContext.currentTime)
                return prev
            })
    }, [audioContext, position])

    useEffect(() => {
        if (audioContext)
            setGainNode((prev) => {
                // eslint-disable-next-line no-param-reassign
                if (!prev) prev = audioContext.createGain()
                console.log('UPDATE GAIN')
                console.log(volume)
                if (volume.muted) {
                    console.log('muted')
                    prev.gain.setValueAtTime(0, audioContext.currentTime)
                } else {
                    prev.gain.setValueAtTime(volume.volume, audioContext.currentTime)
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
export default AudioTrackRenderer

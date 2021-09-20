import {useAudioContext, useRemoteAudioTracks, useStageSelector} from "@digitalstage/api-client-react";
import React from "react";
import {useLocalAudioTracks} from "../../hooks/useLocalAudioTracks";
import {useAudioNodeDispatch} from "../../provider/AudioNodeProvider";

const AudioTrackRenderer = ({audioTrackId, track}: { audioTrackId: string, track: MediaStreamTrack }) => {
    const audioTrack = useStageSelector(state => state.audioTracks.byId[audioTrackId])
    const audioRef = React.useRef<HTMLAudioElement>(null)
    const {audioContext} = useAudioContext()
    const dispatchAudioNode = useAudioNodeDispatch()
    const [sourceNode, setSourceNode] = React.useState<AudioNode>()
    const gainNode = React.useMemo<GainNode>(
        () => audioContext.createGain(),
        [audioContext]
    )
    const customMuted = useStageSelector<boolean | undefined>((state) =>
        state.globals.localDeviceId &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId] &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
            ? state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
                ].muted
            : undefined,
    )
    const customVolume = useStageSelector<number | undefined>((state) =>
        state.globals.localDeviceId &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId] &&
        state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
            ? state.customAudioTrackVolumes.byId[
                state.customAudioTrackVolumes.byDeviceAndAudioTrack[state.globals.localDeviceId][audioTrackId]
                ].volume
            : undefined,
    )

    React.useEffect(() => {
        if (audioContext) {
            const stream = new MediaStream([track])
            const source = audioContext.createMediaStreamSource(stream)
            setSourceNode(source)
            const audioElement = audioRef.current
            audioElement.srcObject = stream
            audioElement.muted = true
            return () => {
                setSourceNode(undefined)
                audioElement.srcObject = undefined
            }
        }
    }, [audioContext, track])

    React.useEffect(() => {
        if (sourceNode && gainNode && audioContext.destination) {
            sourceNode.connect(gainNode)
            gainNode.connect(audioContext.destination)
            return () => {
                gainNode.disconnect(audioContext.destination)
                sourceNode.disconnect(gainNode)
            }
        }
    }, [sourceNode, gainNode, audioContext.destination])


    React.useEffect(() => {
        if (audioContext && gainNode) {
            if (customMuted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else if (customVolume) {
                gainNode.gain.setValueAtTime(customVolume, audioContext.currentTime)
            } else if (audioTrack.muted) {
                gainNode.gain.setValueAtTime(0, audioContext.currentTime)
            } else {
                gainNode.gain.setValueAtTime(audioTrack.volume, audioContext.currentTime)
            }
        }
    }, [
        audioContext,
        gainNode,
        audioTrack.volume,
        audioTrack.muted,
        customVolume,
        customMuted,
    ])

    return (
        <audio ref={audioRef}/>
    )
}

const LocalStageDeviceRenderer = () => {
    const localAudioTracks = useLocalAudioTracks()
    return (
        <>
            {Object.keys(localAudioTracks).map(audioTrackId => <AudioTrackRenderer key={audioTrackId}
                                                                                   audioTrackId={audioTrackId}
                                                                                   track={localAudioTracks[audioTrackId]}/>)}
        </>
    )
}

const RemoteStageDeviceRenderer = ({stageDeviceId}: { stageDeviceId: string }) => {
    const {audioContext} = useAudioContext()
    const analyserNode = React.useMemo<AnalyserNode>(() => audioContext && audioContext.createAnalyser(), [audioContext])
    const remoteAudioTracks = useRemoteAudioTracks(stageDeviceId)

    return (
        <>
            {Object.keys(remoteAudioTracks).map(audioTrackId => <AudioTrackRenderer key={audioTrackId}
                                                                                    audioTrackId={audioTrackId}
                                                                                    track={remoteAudioTracks[audioTrackId]}/>)}
        </>
    )
}

const AudioRenderService = () => {
    const localStageDeviceId = useStageSelector(state => state.globals.localStageDeviceId)
    const stageDeviceIds = useStageSelector(state => state.globals.ready && state.globals.stageId ? state.stageDevices.byStage[state.globals.stageId] : [])
    return (
        <>
            {stageDeviceIds.map(stageDeviceId => {
                if (stageDeviceId === localStageDeviceId) {
                    return (<LocalStageDeviceRenderer key={stageDeviceId}/>)
                }
                return (<RemoteStageDeviceRenderer key={stageDeviceId} stageDeviceId={stageDeviceId}/>)
            })}
        </>
    )
}
export {AudioRenderService}
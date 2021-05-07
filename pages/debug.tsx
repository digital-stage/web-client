import {
    ClientDeviceEvents,
    ClientDevicePayloads,
    Device,
    Group,
    Stage,
    StageMember,
    StageDevice,
    useConnection,
    User,
    useStageSelector,
    useMediasoup,
    MediasoupDevice,
    OvDevice,
    SoundCard,
    JammerDevice,
} from '@digitalstage/api-client-react'
import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { AudioTrack, VideoTrack } from '@digitalstage/api-types'
import PrimaryButton from '../components/ui/button/PrimaryButton'
import DangerButton from '../components/ui/button/DangerButton'
import SecondaryButton from '../components/ui/button/SecondaryButton'
import SingleVideoPlayer from '../components/ui/media/SingleVideoPlayer'

const AudioPlayer = (props: { track: MediaStreamTrack }) => {
    const { track } = props
    const audioRef = useRef<HTMLAudioElement>()

    useEffect(() => {
        if (audioRef) {
            audioRef.current.srcObject = new MediaStream([track])
            audioRef.current.autoplay = true
            audioRef.current.play()
        }
    }, [track, audioRef])

    return (
        <div>
            PLAYER
            <audio autoPlay playsInline ref={audioRef} />
        </div>
    )
}

const AudioTrackView = (props: { id: string }) => {
    const { id } = props
    const audioTrack = useStageSelector<AudioTrack>((state) => state.audioTracks.byId[id])
    const { audioConsumers } = useMediasoup()
    if (audioTrack) {
        return (
            <div>
                <span>AUDIO TRACK {audioTrack._id}</span>
                {audioConsumers[audioTrack._id] && (
                    <AudioPlayer track={audioConsumers[audioTrack._id].track} />
                )}
            </div>
        )
    }
    return <></>
}

const VideoTrackView = (props: { id: string }) => {
    const { id } = props
    const videoTrack = useStageSelector<VideoTrack>((state) => state.videoTracks.byId[id])
    const { videoConsumers } = useMediasoup()
    if (videoTrack) {
        return (
            <div>
                {videoTrack._id}
                {videoConsumers[videoTrack._id] && (
                    <SingleVideoPlayer
                        width="auto"
                        height="300px"
                        track={videoConsumers[videoTrack._id].track}
                    />
                )}
            </div>
        )
    }
    return <></>
}

const StageDeviceView = (props: { id: string }) => {
    const { id } = props
    const stageDevice = useStageSelector<StageDevice>((state) => state.stageDevices.byId[id])
    const videoTrackIds = useStageSelector<string[]>(
        (state) => state.videoTracks.byStageDevice[id] || []
    )
    const audioTrackIds = useStageSelector<string[]>(
        (state) => state.audioTracks.byStageDevice[id] || []
    )

    return (
        <li>
            {stageDevice._id}
            ORDER: {stageDevice.order}
            {videoTrackIds.map((videoTrackId) => (
                <VideoTrackView key={videoTrackId} id={videoTrackId} />
            ))}
            {audioTrackIds.map((audioTrackId) => (
                <AudioTrackView key={audioTrackId} id={audioTrackId} />
            ))}
        </li>
    )
}

const StageMemberView = (props: { id: string }) => {
    const { id } = props
    const stageMember = useStageSelector<StageMember>((state) => state.stageMembers.byId[id])
    const remoteUser = useStageSelector<User>((state) => state.remoteUsers.byId[stageMember.userId])
    const stageDeviceIds = useStageSelector<string[]>(
        (state) => state.stageDevices.byStageMember[id] || []
    )
    return (
        <li>
            Stage member: {remoteUser.name}
            <ul>
                {stageDeviceIds.map((stageDeviceId) => (
                    <StageDeviceView key={stageDeviceId} id={stageDeviceId} />
                ))}
            </ul>
        </li>
    )
}

const GroupView = (props: { id: string; stageId: string }) => {
    const connection = useConnection()
    const { id, stageId } = props
    const group = useStageSelector<Group>((state) => state.groups.byId[id])
    const stageMemberIds = useStageSelector<string[]>(
        (state) => state.stageMembers.byGroup[id] || []
    )
    const currentGroupId = useStageSelector<string | undefined>((state) => state.globals.groupId)
    return (
        <li>
            <h5>
                {group.name} &nbsp;
                {currentGroupId && currentGroupId === id ? (
                    <DangerButton onClick={() => connection.emit(ClientDeviceEvents.LeaveStage)}>
                        Leave
                    </DangerButton>
                ) : (
                    <PrimaryButton
                        onClick={() =>
                            connection.emit(ClientDeviceEvents.JoinStage, {
                                stageId,
                                groupId: id,
                            } as ClientDevicePayloads.JoinStage)
                        }
                    >
                        Join
                    </PrimaryButton>
                )}
            </h5>

            <ul>
                {stageMemberIds.map((stageMemberId) => (
                    <StageMemberView key={stageMemberId} id={stageMemberId} />
                ))}
            </ul>
        </li>
    )
}

const SoundCardView = (props: { id: string }) => {
    const { id } = props
    const soundCard = useStageSelector<SoundCard>((state) => state.soundCards.byId[id])
    const connection = useConnection()
    if (!soundCard) return null
    return (
        <div>
            {soundCard.driver}
            <ul>
                <li>
                    Input channels:
                    <ul>
                        {Object.keys(soundCard.inputChannels).map((channelName) => (
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={soundCard.inputChannels[channelName]}
                                        onChange={(event) =>
                                            connection.emit(ClientDeviceEvents.ChangeSoundCard, {
                                                _id: soundCard._id,
                                                inputChannels: {
                                                    ...soundCard.inputChannels,
                                                    [channelName]: event.currentTarget.checked,
                                                },
                                            })
                                        }
                                    />
                                    {channelName}
                                </label>
                            </li>
                        ))}
                    </ul>
                </li>
                <li>
                    Output channels:
                    <ul>
                        {Object.keys(soundCard.outputChannels).map((channelName) => (
                            <li>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={soundCard.outputChannels[channelName]}
                                        onChange={(event) =>
                                            connection.emit(ClientDeviceEvents.ChangeSoundCard, {
                                                _id: soundCard._id,
                                                outputChannels: {
                                                    ...soundCard.outputChannels,
                                                    [channelName]: event.currentTarget.checked,
                                                },
                                            })
                                        }
                                    />
                                    {channelName}
                                </label>
                            </li>
                        ))}
                    </ul>
                </li>
            </ul>
        </div>
    )
}

const StageView = (props: { id: string }) => {
    const { id } = props
    const stage = useStageSelector<Stage>((state) => state.stages.byId[id])
    const groupIds = useStageSelector<string[]>((state) => state.groups.byStage[id] || [])
    return (
        <li>
            <h4>
                {stage.name} ({stage.videoType}/{stage.audioType})
            </h4>
            <ul>
                {groupIds.map((groupId) => (
                    <GroupView key={groupId} id={groupId} stageId={id} />
                ))}
            </ul>
        </li>
    )
}

const DeviceView = (props: { id: string }) => {
    const { id } = props
    const connection = useConnection()
    const device = useStageSelector<Device>((state) => state.devices.byId[id])

    let videoConfigurationPane
    let audioConfigurationPane
    if (device.canVideo) {
        // Assuming that video transmission always uses mediasoup
        const mediasoupDevice = device as MediasoupDevice
        videoConfigurationPane = (
            <li>
                Input video:
                <select
                    value={mediasoupDevice.inputVideoDeviceId}
                    onChange={(event) =>
                        connection.emit(ClientDeviceEvents.ChangeDevice, {
                            _id: id,
                            inputVideoDeviceId: event.currentTarget.value,
                        })
                    }
                >
                    {mediasoupDevice.inputVideoDevices.map((inputVideoDevice) => (
                        <option key={inputVideoDevice.id} value={inputVideoDevice.id}>
                            {inputVideoDevice.label}
                        </option>
                    ))}
                </select>
            </li>
        )
    }
    if (device.canAudio) {
        if (device.type === 'mediasoup') {
            const mediasoupDevice = device as MediasoupDevice
            audioConfigurationPane = (
                <>
                    <li>
                        Input audio:
                        <select
                            value={mediasoupDevice.inputAudioDeviceId}
                            onChange={(event) =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    inputAudioDeviceId: event.currentTarget.value,
                                })
                            }
                        >
                            {mediasoupDevice.inputAudioDevices.map((inputAudioDevice) => (
                                <option key={inputAudioDevice.id} value={inputAudioDevice.id}>
                                    {inputAudioDevice.label}
                                </option>
                            ))}
                        </select>
                    </li>
                    <li>
                        Output audio:
                        <select
                            value={mediasoupDevice.outputAudioDeviceId}
                            onChange={(event) =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    outputAudioDeviceId: event.currentTarget.value,
                                })
                            }
                        >
                            {mediasoupDevice.outputAudioDevices.map((outputAudioDevice) => (
                                <option key={outputAudioDevice.id} value={outputAudioDevice.id}>
                                    {outputAudioDevice.label}
                                </option>
                            ))}
                        </select>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={mediasoupDevice.autoGainControl || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: id,
                                        autoGainControl: event.currentTarget.checked,
                                    })
                                }
                            />
                            autoGainControl
                        </label>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={mediasoupDevice.echoCancellation || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: id,
                                        echoCancellation: event.currentTarget.checked,
                                    })
                                }
                            />
                            echoCancellation
                        </label>
                    </li>
                    <li>
                        <label>
                            <input
                                type="checkbox"
                                checked={mediasoupDevice.noiseSuppression || false}
                                onChange={(event) =>
                                    connection.emit(ClientDeviceEvents.ChangeDevice, {
                                        _id: id,
                                        noiseSuppression: event.currentTarget.checked,
                                    })
                                }
                            />
                            noiseSuppression
                        </label>
                    </li>
                </>
            )
        }
        if (device.type === 'ov') {
            const ovDevice = device as OvDevice
            audioConfigurationPane = (
                <>
                    <li>
                        ID: {ovDevice._id}
                        MAC: {ovDevice.uuid}
                    </li>
                    {device.availableSoundCardIds.map((soundCardId) => (
                        <SoundCardView key={soundCardId} id={soundCardId} />
                    ))}
                </>
            )
        }
        if (device.type === 'jammer') {
            const jammerDevice = device as JammerDevice
            audioConfigurationPane = (
                <>
                    <li>
                        <select
                            value={jammerDevice.soundCardId}
                            onChange={(event) =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    soundCardId: event.currentTarget.value,
                                })
                            }
                        >
                            {jammerDevice.availableSoundCardIds.map((id) => {
                                const soundCard = useStageSelector<SoundCard>(
                                    (state) => state.soundCards.byId[id]
                                )
                                return (
                                    <option key={soundCard._id} value={soundCard._id}>
                                        {soundCard.label}
                                    </option>
                                )
                            })}
                        </select>
                    </li>
                </>
            )
        }
    }
    return (
        <li>
            {device.online ? <strong>{device.type}</strong> : <i>{device.type}</i>}
            <ul>
                {device.canVideo && (
                    <li>
                        Send video:{' '}
                        <SecondaryButton
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    sendVideo: !device.sendVideo,
                                })
                            }
                        >
                            {device.sendVideo ? 'YES' : 'NO'}
                        </SecondaryButton>
                    </li>
                )}
                {device.canAudio && (
                    <li>
                        Send audio:{' '}
                        <SecondaryButton
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    sendAudio: !device.sendAudio,
                                })
                            }
                        >
                            {device.sendAudio ? 'YES' : 'NO'}
                        </SecondaryButton>
                    </li>
                )}
                {device.canVideo && (
                    <li>
                        Receive video:{' '}
                        <SecondaryButton
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    receiveVideo: !device.receiveVideo,
                                })
                            }
                        >
                            {device.receiveVideo ? 'YES' : 'NO'}
                        </SecondaryButton>
                    </li>
                )}
                {device.canAudio && (
                    <li>
                        Receive audio:{' '}
                        <SecondaryButton
                            onClick={() =>
                                connection.emit(ClientDeviceEvents.ChangeDevice, {
                                    _id: id,
                                    receiveAudio: !device.receiveAudio,
                                })
                            }
                        >
                            {device.receiveAudio ? 'YES' : 'NO'}
                        </SecondaryButton>
                    </li>
                )}
                {videoConfigurationPane}
                {audioConfigurationPane}
            </ul>
        </li>
    )
}

const DEBUG = () => {
    const stageIds = useStageSelector<string[]>((state) => state.stages.allIds)
    const deviceIds = useStageSelector<string[]>((state) => state.devices.allIds)

    return (
        <div>
            <h1>Devices</h1>
            <ul>
                {deviceIds.map((deviceId) => (
                    <DeviceView key={deviceId} id={deviceId} />
                ))}
            </ul>
            <h1>Stages</h1>
            <Link href="/stages">
                <a>
                    <SecondaryButton>Manage stages</SecondaryButton>
                </a>
            </Link>
            <ul>
                {stageIds.map((stageId) => (
                    <StageView key={stageId} id={stageId} />
                ))}
            </ul>
        </div>
    )
}
export default DEBUG

/*
 * Copyright (c) 2021 Tobias Hegemann
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ITeckosClient } from 'teckos-client'
import {
    ClientDeviceEvents,
    ServerDeviceEvents,
    ServerDevicePayloads,
} from '@digitalstage/api-types'
import { BrowserDevice } from '@digitalstage/api-types/dist/model/browser'
import { actions } from './actions'
import { AppDispatch } from './store'

const registerSocketHandler = (dispatch: AppDispatch, socket: ITeckosClient): ITeckosClient => {
    socket.setMaxListeners(80)
    socket.on('disconnect', () => {
        // Cleanup
        dispatch(actions.client.reset())
    })

    socket.on(ServerDeviceEvents.Ready, (payload: ServerDevicePayloads.Ready) => {
        dispatch(actions.server.ready(payload))
    })

    socket.on(
        ServerDeviceEvents.LocalDeviceReady,
        (payload: ServerDevicePayloads.LocalDeviceReady) => {
            dispatch(actions.server.localDeviceReady(payload))
            // Set default media device selections if necessary
            const device = payload as BrowserDevice
            let update = {}
            if (!device.inputVideoDeviceId && device.inputVideoDevices.length > 0) {
                update = {
                    ...update,
                    // Prefer default device
                    inputVideoDeviceId: device.inputVideoDevices.find((d) => d.id === 'default')
                        ? 'default'
                        : device.inputVideoDevices[0].id,
                }
            }
            if (!device.inputAudioDeviceId && device.inputAudioDevices.length > 0) {
                update = {
                    ...update,
                    // Prefer default device
                    inputAudioDeviceId: device.inputAudioDevices.find((d) => d.id === 'default')
                        ? 'default'
                        : device.inputAudioDevices[0].id,
                }
            }
            if (!device.outputAudioDeviceId && device.outputAudioDevices.length > 0) {
                update = {
                    ...update,
                    // Prefer default device
                    outputAudioDeviceId: device.outputAudioDevices.find((d) => d.id === 'default')
                        ? 'default'
                        : device.outputAudioDevices[0].id,
                }
            }
            if (Object.keys(update).length > 0) {
                socket.emit(ClientDeviceEvents.ChangeDevice, {
                    _id: device._id,
                    ...update,
                })
            }
        }
    )

    socket.on(ServerDeviceEvents.UserReady, (payload: ServerDevicePayloads.UserReady) => {
        dispatch(actions.server.userReady(payload))
    })

    socket.on(ServerDeviceEvents.UserChanged, (payload: ServerDevicePayloads.UserChanged) => {
        dispatch(actions.server.changeUser(payload))
    })

    socket.on(ServerDeviceEvents.DeviceAdded, (payload: ServerDevicePayloads.DeviceAdded) => {
        dispatch(actions.server.addDevice(payload))
    })
    socket.on(ServerDeviceEvents.DeviceChanged, (payload: ServerDevicePayloads.DeviceChanged) => {
        dispatch(actions.server.changeDevice(payload))
    })
    socket.on(ServerDeviceEvents.DeviceRemoved, (payload: ServerDevicePayloads.DeviceRemoved) => {
        dispatch(actions.server.removeDevice(payload))
    })

    socket.on(ServerDeviceEvents.UserAdded, (payload: ServerDevicePayloads.UserAdded) => {
        dispatch(actions.server.addUser(payload))
    })

    socket.on(ServerDeviceEvents.UserChanged, (payload: ServerDevicePayloads.UserChanged) => {
        dispatch(actions.server.changeUser(payload))
    })

    socket.on(ServerDeviceEvents.UserRemoved, (payload: ServerDevicePayloads.UserRemoved) => {
        dispatch(actions.server.removeUser(payload))
    })

    socket.on(
        ServerDeviceEvents.ChatMessageSend,
        (payload: ServerDevicePayloads.ChatMessageSend) => {
            dispatch(actions.server.messageSent(payload))
        }
    )

    socket.on(ServerDeviceEvents.StageAdded, (payload: ServerDevicePayloads.StageAdded) => {
        dispatch(actions.server.addStage(payload))
    })
    socket.on(ServerDeviceEvents.StageJoined, (payload: ServerDevicePayloads.StageJoined) => {
        dispatch(actions.server.stageJoined(payload))
    })
    socket.on(ServerDeviceEvents.StageLeft, () => {
        dispatch(actions.server.stageLeft())
    })
    socket.on(ServerDeviceEvents.StageChanged, (payload: ServerDevicePayloads.StageChanged) => {
        dispatch(actions.server.changeStage(payload))
    })
    socket.on(ServerDeviceEvents.StageRemoved, (payload: ServerDevicePayloads.StageRemoved) => {
        dispatch(actions.server.removeStage(payload))
    })

    socket.on(ServerDeviceEvents.GroupAdded, (payload: ServerDevicePayloads.GroupAdded) => {
        dispatch(actions.server.addGroup(payload))
    })
    socket.on(ServerDeviceEvents.GroupChanged, (payload: ServerDevicePayloads.GroupChanged) => {
        dispatch(actions.server.changeGroup(payload))
    })
    socket.on(ServerDeviceEvents.GroupRemoved, (payload: ServerDevicePayloads.GroupRemoved) => {
        dispatch(actions.server.removeGroup(payload))
    })

    socket.on(
        ServerDeviceEvents.CustomGroupVolumeAdded,
        (payload: ServerDevicePayloads.CustomGroupVolumeAdded) => {
            dispatch(actions.server.addCustomGroupVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomGroupVolumeChanged,
        (payload: ServerDevicePayloads.CustomGroupVolumeChanged) => {
            dispatch(actions.server.changeCustomGroupVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomGroupVolumeRemoved,
        (payload: ServerDevicePayloads.CustomGroupVolumeRemoved) => {
            dispatch(actions.server.removeCustomGroupVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomGroupPositionAdded,
        (payload: ServerDevicePayloads.CustomGroupPositionAdded) => {
            dispatch(actions.server.addCustomGroupPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomGroupPositionChanged,
        (payload: ServerDevicePayloads.CustomGroupPositionChanged) => {
            dispatch(actions.server.changeCustomGroupPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomGroupPositionRemoved,
        (payload: ServerDevicePayloads.CustomGroupPositionRemoved) => {
            dispatch(actions.server.removeCustomGroupPosition(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.StageMemberAdded,
        (payload: ServerDevicePayloads.StageMemberAdded) => {
            dispatch(actions.server.addStageMember(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.StageMemberChanged,
        (payload: ServerDevicePayloads.StageMemberChanged) => {
            dispatch(actions.server.changeStageMember(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.StageMemberRemoved,
        (payload: ServerDevicePayloads.StageMemberRemoved) => {
            dispatch(actions.server.removeStageMember(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.CustomStageMemberVolumeAdded,
        (payload: ServerDevicePayloads.CustomStageMemberVolumeAdded) => {
            dispatch(actions.server.addCustomStageMemberVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageMemberVolumeChanged,
        (payload: ServerDevicePayloads.CustomStageMemberVolumeChanged) => {
            dispatch(actions.server.changeCustomStageMemberVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageMemberVolumeRemoved,
        (payload: ServerDevicePayloads.CustomStageMemberVolumeRemoved) => {
            dispatch(actions.server.removeCustomStageMemberVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageMemberPositionAdded,
        (payload: ServerDevicePayloads.CustomStageMemberPositionAdded) => {
            dispatch(actions.server.addCustomStageMemberPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageMemberPositionChanged,
        (payload: ServerDevicePayloads.CustomStageMemberPositionChanged) => {
            dispatch(actions.server.changeCustomStageMemberPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageMemberPositionRemoved,
        (payload: ServerDevicePayloads.CustomStageMemberPositionRemoved) => {
            dispatch(actions.server.removeCustomStageMemberPosition(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.StageDeviceAdded,
        (payload: ServerDevicePayloads.StageDeviceAdded) => {
            dispatch(actions.server.addStageDevice(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.StageDeviceChanged,
        (payload: ServerDevicePayloads.StageDeviceChanged) => {
            dispatch(actions.server.changeStageDevice(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.StageDeviceRemoved,
        (payload: ServerDevicePayloads.StageDeviceRemoved) => {
            dispatch(actions.server.removeStageDevice(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.CustomStageDeviceVolumeAdded,
        (payload: ServerDevicePayloads.CustomStageDeviceVolumeAdded) => {
            dispatch(actions.server.addCustomStageDeviceVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageDeviceVolumeChanged,
        (payload: ServerDevicePayloads.CustomStageDeviceVolumeChanged) => {
            dispatch(actions.server.changeCustomStageDeviceVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageDeviceVolumeRemoved,
        (payload: ServerDevicePayloads.CustomStageDeviceVolumeRemoved) => {
            dispatch(actions.server.removeCustomStageDeviceVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageDevicePositionAdded,
        (payload: ServerDevicePayloads.CustomStageDevicePositionAdded) => {
            dispatch(actions.server.addCustomStageDevicePosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageDevicePositionChanged,
        (payload: ServerDevicePayloads.CustomStageDevicePositionChanged) => {
            dispatch(actions.server.changeCustomStageDevicePosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomStageDevicePositionRemoved,
        (payload: ServerDevicePayloads.CustomStageDevicePositionRemoved) => {
            dispatch(actions.server.removeCustomStageDevicePosition(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.VideoTrackAdded,
        (payload: ServerDevicePayloads.VideoTrackAdded) => {
            dispatch(actions.server.addVideoTrack(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.VideoTrackChanged,
        (payload: ServerDevicePayloads.VideoTrackChanged) => {
            dispatch(actions.server.changeVideoTrack(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.VideoTrackRemoved,
        (payload: ServerDevicePayloads.VideoTrackRemoved) => {
            dispatch(actions.server.removeVideoTrack(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.AudioTrackAdded,
        (payload: ServerDevicePayloads.AudioTrackAdded) => {
            dispatch(actions.server.addAudioTrack(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.AudioTrackChanged,
        (payload: ServerDevicePayloads.AudioTrackChanged) => {
            dispatch(actions.server.changeAudioTrack(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.AudioTrackRemoved,
        (payload: ServerDevicePayloads.AudioTrackRemoved) => {
            dispatch(actions.server.removeAudioTrack(payload))
        }
    )

    socket.on(
        ServerDeviceEvents.CustomAudioTrackVolumeAdded,
        (payload: ServerDevicePayloads.CustomAudioTrackVolumeAdded) => {
            dispatch(actions.server.addCustomAudioTrackVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomAudioTrackVolumeChanged,
        (payload: ServerDevicePayloads.CustomAudioTrackVolumeChanged) => {
            dispatch(actions.server.changeCustomAudioTrackVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomAudioTrackVolumeRemoved,
        (payload: ServerDevicePayloads.CustomAudioTrackVolumeRemoved) => {
            dispatch(actions.server.removeCustomAudioTrackVolume(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomAudioTrackPositionAdded,
        (payload: ServerDevicePayloads.CustomAudioTrackPositionAdded) => {
            dispatch(actions.server.addCustomAudioTrackPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomAudioTrackPositionChanged,
        (payload: ServerDevicePayloads.CustomAudioTrackPositionChanged) => {
            dispatch(actions.server.changeCustomAudioTrackPosition(payload))
        }
    )
    socket.on(
        ServerDeviceEvents.CustomAudioTrackPositionRemoved,
        (payload: ServerDevicePayloads.CustomAudioTrackPositionRemoved) => {
            dispatch(actions.server.removeCustomAudioTrackPosition(payload))
        }
    )

    socket.on(ServerDeviceEvents.SoundCardAdded, (payload: ServerDevicePayloads.SoundCardAdded) =>
        dispatch({
            type: ServerDeviceEvents.SoundCardAdded,
            payload,
        })
    )
    socket.on(
        ServerDeviceEvents.SoundCardChanged,
        (payload: ServerDevicePayloads.SoundCardChanged) =>
            dispatch({
                type: ServerDeviceEvents.SoundCardChanged,
                payload,
            })
    )
    socket.on(
        ServerDeviceEvents.SoundCardRemoved,
        (payload: ServerDevicePayloads.SoundCardRemoved) =>
            dispatch({
                type: ServerDeviceEvents.SoundCardRemoved,
                payload,
            })
    )

    return socket
}

export { registerSocketHandler }

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

import { CustomGroupPositions } from './CustomGroupPositions'
import { CustomGroupVolumes } from './CustomGroupVolumes'
import { CustomAudioTrackPositions } from './CustomAudioTrackPositions'
import { CustomAudioTrackVolumes } from './CustomAudioTrackVolumes'
import { CustomStageMemberPositions } from './CustomStageMemberPositions'
import { CustomStageMemberVolumes } from './CustomStageMemberVolumes'
import { Devices } from './Devices'
import { Globals } from './Globals'
import { Groups } from './Groups'
import { AudioTracks } from './AudioTracks'
import { Users } from './Users'
import { VideoTracks } from './VideoTracks'
import { Routers } from './Routers'
import { SoundCards } from './SoundCards'
import { StageDevices } from './StageDevices'
import { StageMembers } from './StageMembers'
import { Stages } from './Stages'
import { Notifications, Notification } from './Notifications'
import { Auth } from './Auth'

export type {
    Auth,
    Notifications,
    Notification,
    CustomGroupPositions,
    CustomGroupVolumes,
    CustomAudioTrackPositions,
    CustomAudioTrackVolumes,
    CustomStageMemberPositions,
    CustomStageMemberVolumes,
    Devices,
    Globals,
    Groups,
    AudioTracks,
    Users,
    VideoTracks,
    Routers,
    SoundCards,
    StageMembers,
    StageDevices,
    Stages,
    // RootState,
}

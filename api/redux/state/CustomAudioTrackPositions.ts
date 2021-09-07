import { CustomAudioTrackPosition } from '@digitalstage/api-types'

interface CustomAudioTrackPositions {
    byId: {
        [id: string]: CustomAudioTrackPosition
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byAudioTrack: {
        [remoteAudioTrackId: string]: string[]
    }
    byDeviceAndAudioTrack: {
        [deviceId: string]: {
            [remoteAudioTrackId: string]: string
        }
    }
    allIds: string[]
}

export type { CustomAudioTrackPositions }

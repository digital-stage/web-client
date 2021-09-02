import { CustomAudioTrackVolume } from '@digitalstage/api-types'

interface CustomAudioTrackVolumes {
    byId: {
        [id: string]: CustomAudioTrackVolume
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byAudioTrack: {
        [audioTrackId: string]: string[]
    }
    byDeviceAndAudioTrack: {
        [deviceId: string]: {
            [audioTrackId: string]: string
        }
    }
    allIds: string[]
}

export type { CustomAudioTrackVolumes }

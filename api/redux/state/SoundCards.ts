import { SoundCard } from '@digitalstage/api-types'

interface SoundCards {
    byId: {
        [id: string]: SoundCard
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byDeviceAndUUID: {
        [deviceId: string]: {
            [uuid: string]: string
        }
    }
    allIds: string[]
}

export type { SoundCards }

import { CustomStageDevicePosition } from '@digitalstage/api-types'

interface CustomStageDevicePositions {
    byId: {
        [id: string]: CustomStageDevicePosition
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byStageDevice: {
        [stageDeviceId: string]: string[]
    }
    byDeviceAndStageDevice: {
        [deviceId: string]: {
            [stageDeviceId: string]: string
        }
    }
    allIds: string[]
}

export type { CustomStageDevicePositions }

import { CustomStageDeviceVolume } from '@digitalstage/api-types'

interface CustomStageDeviceVolumes {
    byId: {
        [id: string]: CustomStageDeviceVolume
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

export default CustomStageDeviceVolumes

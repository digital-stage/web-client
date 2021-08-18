import { CustomGroupVolume } from '@digitalstage/api-types'

interface CustomGroupVolumes {
    byId: {
        [id: string]: CustomGroupVolume
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byGroup: {
        [groupId: string]: string[]
    }
    byDeviceAndGroup: {
        [deviceId: string]: {
            [groupId: string]: string
        }
    }
    allIds: string[]
}

export default CustomGroupVolumes

import { CustomStageMemberPosition } from '@digitalstage/api-types'

interface CustomStageMemberPositions {
    byId: {
        [id: string]: CustomStageMemberPosition
    }
    byDevice: {
        [deviceId: string]: string[]
    }
    byStageMember: {
        [stageMemberId: string]: string[]
    }
    byDeviceAndStageMember: {
        [deviceId: string]: {
            [stageMemberId: string]: string
        }
    }
    allIds: string[]
}

export default CustomStageMemberPositions

import { StageDevice } from '@digitalstage/api-types'

interface StageDevices {
    byId: {
        [id: string]: StageDevice
    }
    byStage: {
        [stageId: string]: string[]
    }
    byGroup: {
        [groupId: string]: string[]
    }
    byStageMember: {
        [stageMemberId: string]: string[]
    }
    byUser: {
        [userId: string]: string[]
    }
    byStageAndDevice: {
        [stageId: string]: {
            [deviceId: string]: string
        }
    }
    allIds: string[]
}

export type { StageDevices }

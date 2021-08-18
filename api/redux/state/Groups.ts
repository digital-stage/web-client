import { Group } from '@digitalstage/api-types'

interface Groups {
    byId: {
        [id: string]: Group
    }
    byStage: {
        [stageId: string]: string[]
    }
    allIds: string[]
}

export default Groups

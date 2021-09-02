import { AudioTrack } from '@digitalstage/api-types'

interface AudioTracks {
    byId: {
        [id: string]: AudioTrack
    }
    byStage: {
        [stageId: string]: string[]
    }
    byStageMember: {
        [stageMemberId: string]: string[]
    }
    byStageDevice: {
        [stageDeviceId: string]: string[]
    }
    byUser: {
        [userId: string]: string[]
    }
    allIds: string[]
}

export type { AudioTracks }

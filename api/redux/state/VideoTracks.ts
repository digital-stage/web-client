import { VideoTrack } from '@digitalstage/api-types'

interface VideoTracks {
    byId: {
        [id: string]: VideoTrack
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

export default VideoTracks

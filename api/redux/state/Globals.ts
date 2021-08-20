import { ITeckosClient } from 'teckos-client'

interface Globals {
    ready: boolean

    /* Information about this device */
    localDeviceId?: string
    localUserId?: string

    /* Information about the active stage */
    stageId?: string
    stageMemberId?: string
    groupId?: string
    localStageDeviceId?: string

    /* Selection of the device (depends on session) */
    selectedDeviceId?: string
    selectedMode: 'global' | 'personal'

    /* Audio device information */
    audioStarted: boolean
    levels: {
        [uuid: string]: ArrayBuffer
    }

    connection?: ITeckosClient
}
export default Globals

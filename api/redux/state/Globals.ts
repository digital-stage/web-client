interface Globals {
    ready: boolean

    /* Information about this device */
    localDeviceId?: string
    localUserId?: string

    /* Information about the active stage */
    stageId?: string
    groupId?: string
    localStageDeviceId?: string
    // Request for joining (processed by react handlers)
    request?: {
        stageId: string
        groupId?: string
        password?: string
    }

    /* Selection of the device (depends on session) */
    selectedDeviceId?: string
    selectedMode: 'global' | 'personal'
}

export default Globals

import { Device } from '@digitalstage/api-types'

interface Devices {
    byId: {
        [id: string]: Device
    }
    allIds: string[]
}

export type { Devices }

import { Stage } from '@digitalstage/api-types'

interface Stages {
    byId: {
        [id: string]: Stage
    }
    allIds: string[]
}

export type { Stages }

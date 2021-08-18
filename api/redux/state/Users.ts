import { User } from '@digitalstage/api-types'

interface Users {
    byId: {
        [id: string]: User
    }
    allIds: string[]
}

export default Users

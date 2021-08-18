import { User } from '@digitalstage/api-types'

export interface AuthUser {
    _id: string
    name: string
    email: string
    password: string
}

interface Auth {
    initialized: boolean
    user?: AuthUser
    token?: string
}

export default Auth

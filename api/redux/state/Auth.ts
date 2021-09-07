export interface AuthUser {
    _id: string
    name: string
    email: string
    password: string
}

export interface Auth {
    initialized: boolean
    user?: AuthUser
    token?: string
}

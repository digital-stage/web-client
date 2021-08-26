export interface KIND {
    info: 'info'
    warn: 'warn'
    success: 'success'
    error: 'error'
}

export interface Notification {
    id: string
    date: number
    kind: KIND[keyof KIND]
    message: string
    link?: string
    featured: boolean
    permanent: boolean
}

export interface Notifications {
    byId: {
        [id: string]: Notification
    }
    allIds: string[]
}

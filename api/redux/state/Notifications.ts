export interface KIND {
    info: 'info'
    warn: 'warn'
    success: 'success'
    error: 'error'
}

interface Notification {
    id: string
    date: number
    kind: KIND[keyof KIND]
    message: any
    featured: boolean
    permanent: boolean
}

interface Notifications {
    byId: {
        [id: string]: Notification
    }
    allIds: string[]
}

export type { Notification }
export default Notifications

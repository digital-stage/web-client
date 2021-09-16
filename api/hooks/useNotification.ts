import { useCallback } from 'react'
import { KIND } from '../redux/state/Notifications'
import { useDispatch } from 'react-redux'
import { addNotification } from '../redux/actions/clientActions'
import { v4 as uuidv4 } from 'uuid'

type NotificationContextT = (report: {
    kind?: KIND[keyof KIND]
    message: any
    link?: string
    permanent?: boolean
}) => void

const useNotification = (): NotificationContextT => {
    const dispatch = useDispatch()

    return useCallback(
        ({
            kind = 'info',
            message,
            link,
            permanent,
        }: {
            kind?: KIND[keyof KIND]
            message: any
            link?: string
            permanent?: boolean
        }) => {
            if (typeof message === 'string') {
                dispatch(
                    addNotification({
                        id: uuidv4(),
                        date: new Date().getTime(),
                        kind: kind,
                        link: link,
                        message: message,
                        permanent: permanent,
                        featured: true,
                    })
                )
            } else if ((message as unknown).toString) {
                dispatch(
                    addNotification({
                        id: uuidv4(),
                        date: new Date().getTime(),
                        kind: kind,
                        link: link,
                        message: message.toString(),
                        permanent: permanent,
                        featured: true,
                    })
                )
            }
        },
        [dispatch]
    )
}
export { useNotification }

import { useCallback } from 'react'
import { KIND } from '../redux/state/Notifications'
import { useDispatch } from 'react-redux'
import { addNotification } from '../redux/actions/clientActions'
import { v4 as uuid4 } from 'uuid'

interface ReportContextT {
    report: (kind: KIND[keyof KIND], message: string, link?: string, permanent?: boolean) => void
}

const useReport = (): ReportContextT => {
    const dispatch = useDispatch()

    const report = useCallback(
        (kind: KIND[keyof KIND] = 'info', message: string, link?: string, permanent?: boolean) => {
            dispatch(
                addNotification({
                    id: uuid4(),
                    date: new Date().getTime(),
                    kind: kind,
                    message: message,
                    permanent: permanent,
                    featured: true,
                })
            )
        },
        [dispatch]
    )

    return {
        report,
    }
}
export { useReport }
